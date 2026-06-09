import React, { useState, useEffect } from "react";
import { useTimer } from "../../hooks/useTimer.js";
import { useAudioRecorder } from "../../hooks/useAudioRecorder.js";
import { AppTimer } from "../ui/AppTimer.jsx";
import { transcribeAudio, isSTTAvailable } from "../../utils/speechToText.js";
import { normalizeArabic, fuzzyScore } from "../../utils/arabic.js";

/**
 * TimedNaming — rapid naming with optional automatic STT.
 *
 * When STT is available:
 *   1. Child presses Start → timer + mic recording begin
 *   2. Child names items aloud, presses Done → audio sent to HF model
 *   3. Transcription compared against stimuli → error count auto-calculated
 *   4. Falls back to manual mode if STT fails
 *
 * When STT is not available (or after failure):
 *   Uses the original manual error-count dropdown.
 */
export function TimedNaming({ item, onFinish }) {
  const { elapsed, started, start, stop } = useTimer();
  const recorder = useAudioRecorder();

  const [errors, setErrors] = useState("0");
  // "idle" | "recording" | "processing" | "manual" | "auto-done"
  const [phase, setPhase] = useState("idle");
  const [sttError, setSttError] = useState(null);
  const [autoResult, setAutoResult] = useState(null);
  const [transcription, setTranscription] = useState("");

  // Extract plain text labels from stimuli (remove emojis)
  const expectedLabels = item.stimuli.map((s) =>
    s.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, "").trim()
  );

  async function handleStart() {
    start();
    try {
      await recorder.start();
      setPhase("recording");
    } catch {
      // Mic not available → fall back to manual
      setPhase("manual");
    }
  }

  async function handleStopAuto() {
    stop();
    setPhase("processing");

    try {
      const blob = await recorder.stop();
      if (!blob) throw new Error("لم يتم تسجيل صوت");

      const text = await transcribeAudio(blob, expectedLabels.join(" "));
      setTranscription(text);

      const result = matchStimuli(text, expectedLabels);
      setAutoResult(result);
      setPhase("auto-done");
    } catch (err) {
      console.error("STT failed in TimedNaming:", err);
      setSttError(err.message);
      setPhase("manual");
    }
  }

  function handleAutoSubmit() {
    if (!autoResult) return;
    const accuracy = Math.max(
      0,
      ((item.expectedCount - autoResult.errorCount) / item.expectedCount) * 100
    );
    onFinish(accuracy, `auto:errors=${autoResult.errorCount}`, {
      elapsedMs: elapsed,
      errorCount: autoResult.errorCount,
      transcription: transcription,
      matchDetails: autoResult.details,
      mode: "automatic",
    });
  }

  function handleStopManual() {
    stop();
    setPhase("manual");
    // Stop recorder if it was running
    recorder.stop().catch(() => {});
  }

  function handleManualSubmit() {
    const used = elapsed;
    const errorCount = Number(errors || 0);
    const accuracy = Math.max(
      0,
      ((item.expectedCount - errorCount) / item.expectedCount) * 100
    );
    onFinish(accuracy, `errors:${errorCount}`, {
      elapsedMs: used,
      errorCount,
      mode: "manual",
    });
  }

  return (
    <>
      {/* Timer + start/stop controls */}
      {phase === "idle" && (
        <div className="speechControls">
          <AppTimer
            elapsed={elapsed}
            started={false}
            onStart={handleStart}
            onStop={() => {}}
          />
          <p className="hint">🎤 سيتم تسجيل صوتك لتحليل الإجابة تلقائيًا</p>
        </div>
      )}

      {phase === "recording" && (
        <div className="speechControls">
          <AppTimer
            elapsed={elapsed}
            started={started}
            onStart={() => {}}
            onStop={handleStopAuto}
            stopText="تم"
          />
          <div className="recordingIndicator" aria-live="polite">
            <span className="recordDot" />
            جاري التسجيل...
          </div>
        </div>
      )}

      {phase === "processing" && (
        <div className="speechControls" aria-live="polite">
          <div className="processingSpinner">
            <span className="spinner" />
            جاري التحليل...
          </div>
        </div>
      )}

      {/* Grid of items to name — always visible during recording */}
      {(phase === "idle" || phase === "recording" || phase === "manual") && (
        <div
          className="timedGrid"
          role="group"
          aria-label="العناصر المراد تسميتها"
        >
          {item.stimuli.map((x, i) => (
            <div className="tile" key={i} aria-label={`عنصر ${x}`}>
              {x}
            </div>
          ))}
        </div>
      )}

      {/* Manual fallback */}
      {phase === "manual" && (
        <div className="fallbackMode">
          {sttError && <p className="errorMsg">⚠️ {sttError}</p>}
          <AppTimer
            elapsed={elapsed}
            started={started}
            onStart={start}
            onStop={stop}
          />
          <label className="label compact">
            عدد الأخطاء أو الترددات
            <select
              value={errors}
              onChange={(e) => setErrors(e.target.value)}
              aria-label="اختر عدد الأخطاء أو الترددات"
            >
              <option value="0">0</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4 أو أكثر</option>
            </select>
          </label>
          <button
            type="button"
            className="primary"
            disabled={!started && !elapsed}
            onClick={handleManualSubmit}
          >
            تم
          </button>
        </div>
      )}

      {/* Auto results & therapist confirmation */}
      {phase === "auto-done" && autoResult && (
        <div className="speechResults" aria-live="polite" style={{
          background: "rgba(255, 255, 255, 0.95)",
          borderRadius: "16px",
          padding: "24px",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
          border: "1px solid rgba(226, 232, 240, 0.8)",
          marginTop: "20px",
          fontFamily: "inherit"
        }}>
          <h3 style={{
            fontSize: "20px",
            color: "#1e293b",
            marginBottom: "20px",
            textAlign: "center",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px"
          }}>
            📊 نتيجة التحليل التلقائي
          </h3>
          
          <div className="sttStats" style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "12px",
            marginBottom: "24px",
            textAlign: "center"
          }}>
            <div className="statItem" style={{
              background: "linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)",
              padding: "12px 8px",
              borderRadius: "12px",
              border: "1px solid #fecaca"
            }}>
              <div className="statLabel" style={{ fontSize: "12px", color: "#991b1b", marginBottom: "4px" }}>عدد الأخطاء</div>
              <div className="statValue" style={{ fontSize: "20px", fontWeight: "bold", color: "#dc2626" }}>{autoResult.errorCount}</div>
            </div>
            <div className="statItem" style={{
              background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
              padding: "12px 8px",
              borderRadius: "12px",
              border: "1px solid #bbf7d0"
            }}>
              <div className="statLabel" style={{ fontSize: "12px", color: "#14532d", marginBottom: "4px" }}>العناصر المكتشفة</div>
              <div className="statValue" style={{ fontSize: "20px", fontWeight: "bold", color: "#15803d" }}>{expectedLabels.length - autoResult.errorCount} / {expectedLabels.length}</div>
            </div>
            <div className="statItem" style={{
              background: "linear-gradient(135deg, #fafaf9 0%, #f5f5f4 100%)",
              padding: "12px 8px",
              borderRadius: "12px",
              border: "1px solid #e7e5e4"
            }}>
              <div className="statLabel" style={{ fontSize: "12px", color: "#44403c", marginBottom: "4px" }}>زمن الاستجابة</div>
              <div className="statValue" style={{ fontSize: "20px", fontWeight: "bold", color: "#57534e" }}>{(elapsed / 1000).toFixed(1)}ث</div>
            </div>
          </div>

          <div className="transcriptionBox" style={{
            background: "#f8fafc",
            borderRadius: "12px",
            padding: "14px 18px",
            border: "1px solid #e2e8f0",
            marginBottom: "20px",
            textAlign: "right"
          }}>
            <strong style={{ fontSize: "14px", color: "#64748b", display: "block", marginBottom: "6px" }}>الكلمات المسموعة:</strong>
            <p className="transcriptionText" style={{
              fontSize: "18px",
              fontWeight: "600",
              color: "#334155",
              margin: 0,
              lineHeight: "1.5"
            }}>{transcription || "(لم يتم سماع كلمات بوضوح)"}</p>
          </div>

          <div className="wordDetailList" style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            marginBottom: "28px"
          }}>
            <strong style={{ fontSize: "14px", color: "#64748b", display: "block", marginBottom: "4px", textAlign: "right" }}>تفاصيل تسمية العناصر:</strong>
            {autoResult.details.map((w, idx) => (
              <div key={idx} className={`wordScoreRow ${w.found ? "correct" : "incorrect"}`} style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 16px",
                borderRadius: "10px",
                background: w.found ? "#f0fdf4" : "#fef2f2",
                border: w.found ? "1px solid #bbf7d0" : "1px solid #fecaca",
                direction: "rtl"
              }}>
                <span className="wordExpected" style={{
                  fontSize: "16px",
                  fontWeight: "bold",
                  color: w.found ? "#15803d" : "#b91c1c"
                }}>{w.expected}</span>
                
                <span style={{ fontSize: "12px", color: "#94a3b8" }}>⬅️</span>
                
                <span className="wordBestMatch" style={{
                  fontSize: "15px",
                  color: w.found ? "#166534" : "#991b1b",
                  fontStyle: w.bestMatch ? "normal" : "italic"
                }}>{w.bestMatch || "(لم تُنطق)"}</span>
                
                <span className="wordStatusIcon" style={{ fontSize: "16px" }}>{w.found ? "🟢" : "🔴"}</span>
              </div>
            ))}
          </div>

          <div className="actionButtons" style={{
            display: "flex",
            gap: "12px",
            justifyContent: "center",
            marginTop: "12px"
          }}>
            <button
              type="button"
              className="primary"
              onClick={handleAutoSubmit}
              style={{
                padding: "12px 28px",
                fontSize: "16px",
                fontWeight: "bold",
                borderRadius: "12px",
                border: "none",
                background: "#0284c7",
                color: "#ffffff",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(2, 132, 199, 0.2)"
              }}
            >
              تأكيد واستمرار ➔
            </button>
            <button
              type="button"
              className="secondary"
              onClick={() => setPhase("manual")}
              style={{
                padding: "12px 18px",
                fontSize: "14px",
                fontWeight: "600",
                borderRadius: "12px",
                border: "1px solid #cbd5e1",
                background: "#ffffff",
                color: "#64748b",
                cursor: "pointer"
              }}
            >
              تعديل يدوي ✏️
            </button>
          </div>
        </div>
      )}
    </>
  );
}

/**
 * Match transcription against expected stimuli labels.
 * Returns { errorCount, details[] }
 */
function matchStimuli(transcription, expectedLabels) {
  const transcribedTokens = normalizeArabic(transcription)
    .split(/\s+/)
    .filter(Boolean);

  const details = expectedLabels.map((label) => {
    const normalized = normalizeArabic(label);
    let bestScore = 0;
    let bestMatch = "";
    for (const token of transcribedTokens) {
      const score = fuzzyScore(token, normalized);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = token;
      }
    }
    return {
      expected: label,
      bestMatch,
      score: bestScore,
      found: bestScore >= 60, // slightly lower threshold for rapid naming
    };
  });

  const errorCount = details.filter((d) => !d.found).length;
  return { errorCount, details };
}

export default TimedNaming;
