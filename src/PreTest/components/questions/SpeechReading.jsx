import React, { useState } from "react";
import { useTimer } from "../../hooks/useTimer.js";
import { useAudioRecorder } from "../../hooks/useAudioRecorder.js";
import { AppTimer } from "../ui/AppTimer.jsx";
import { transcribeAudio, isSTTAvailable } from "../../utils/speechToText.js";
import { normalizeArabic, fuzzyScore } from "../../utils/arabic.js";

/**
 * SpeechReading — automated reading assessment via speech-to-text.
 *
 * Flow:
 *  1. Display word(s) to read aloud
 *  2. Child presses "ابدأ" → mic records, timer starts
 *  3. Child presses "انتهيت" → recording stops, audio sent to HF model
 *  4. Transcription compared against expected words
 *  5. Score = accuracy + time → onFinish()
 *
 * Falls back to manual error counting if STT fails.
 */
export function SpeechReading({ item, onFinish }) {
  const { elapsed, started, start: startTimer, stop: stopTimer } = useTimer();
  const recorder = useAudioRecorder();

  // Phases: "ready" | "recording" | "processing" | "fallback" | "done"
  const [phase, setPhase] = useState("ready");
  const [transcription, setTranscription] = useState("");
  const [matchResult, setMatchResult] = useState(null);
  const [sttError, setSttError] = useState(null);
  const [manualErrors, setManualErrors] = useState("0");

  const expectedWords = item.expectedWords || [item.text || item.word || ""];

  async function handleStart() {
    setPhase("recording");
    setSttError(null);
    startTimer();
    try {
      await recorder.start();
    } catch (err) {
      setSttError("لم يتم السماح باستخدام المايكروفون: " + err.message);
      setPhase("fallback");
      stopTimer();
    }
  }

  async function handleStop() {
    stopTimer();
    setPhase("processing");

    try {
      const blob = await recorder.stop();
      if (!blob) throw new Error("لم يتم تسجيل صوت");

      const text = await transcribeAudio(blob, expectedWords.join(" "));
      setTranscription(text);

      // Compare transcription against expected words
      const result = compareWords(text, expectedWords);
      setMatchResult(result);
      setPhase("done");
    } catch (err) {
      console.error("STT Error:", err);
      setSttError(err.message || "حدث خطأ في التعرف على الصوت");
      setPhase("fallback");
    }
  }

  function handleDoneSubmit() {
    if (!matchResult) return;
    const accuracy = matchResult.accuracy;
    onFinish(accuracy, transcription, {
      elapsedMs: elapsed,
      transcription: transcription,
      expectedWords,
      matchedCount: matchResult.matched,
      missedCount: matchResult.missed,
      totalExpected: matchResult.total,
      wordScores: matchResult.wordScores,
      mode: "automatic",
    });
  }

  function handleManualSubmit() {
    const errorCount = Number(manualErrors || 0);
    const total = expectedWords.length;
    const accuracy = Math.max(0, ((total - errorCount) / total) * 100);
    onFinish(accuracy, `manual:errors=${errorCount}`, {
      elapsedMs: elapsed,
      errorCount,
      mode: "manual",
    });
  }

  return (
    <>
      {/* Display words to read */}
      <div
        className="reading speechReadingWords"
        aria-label="الكلمات المطلوب قراءتها"
      >
        {expectedWords.map((w, i) => (
          <span key={i} className="speechWord">
            {w}
          </span>
        ))}
      </div>

      {/* Timer + Controls */}
      {phase === "ready" && (
        <div className="speechControls">
          <p className="hint">🎤 اضغط ابدأ ثم اقرأ الكلمات بصوت واضح</p>
          <button
            type="button"
            className="primary"
            onClick={handleStart}
            aria-label="ابدأ التسجيل"
          >
            🎤 ابدأ
          </button>
        </div>
      )}

      {phase === "recording" && (
        <div className="speechControls">
          <AppTimer
            elapsed={elapsed}
            started={started}
            onStart={() => {}}
            onStop={handleStop}
            stopText="انتهيت"
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

      {/* Fallback: manual error counting */}
      {phase === "fallback" && (
        <div className="speechControls fallbackMode" aria-live="assertive">
          {sttError && <p className="errorMsg">⚠️ {sttError}</p>}
          <p>الرجاء إدخال عدد الأخطاء يدويًا:</p>
          <label className="label compact">
            عدد الأخطاء
            <select
              value={manualErrors}
              onChange={(e) => setManualErrors(e.target.value)}
              aria-label="اختر عدد الأخطاء"
            >
              {Array.from({ length: expectedWords.length + 1 }, (_, i) => (
                <option key={i} value={String(i)}>
                  {i}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            className="primary"
            onClick={handleManualSubmit}
          >
            تم
          </button>
        </div>
      )}

      {/* Done: show results and wait for therapist confirmation */}
      {phase === "done" && matchResult && (
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
              background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
              padding: "12px 8px",
              borderRadius: "12px",
              border: "1px solid #bfdbfe"
            }}>
              <div className="statLabel" style={{ fontSize: "12px", color: "#1e3a8a", marginBottom: "4px" }}>دقة القراءة</div>
              <div className="statValue" style={{ fontSize: "20px", fontWeight: "bold", color: "#1d4ed8" }}>{Math.round(matchResult.accuracy)}%</div>
            </div>
            <div className="statItem" style={{
              background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
              padding: "12px 8px",
              borderRadius: "12px",
              border: "1px solid #bbf7d0"
            }}>
              <div className="statLabel" style={{ fontSize: "12px", color: "#14532d", marginBottom: "4px" }}>الكلمات المقروءة</div>
              <div className="statValue" style={{ fontSize: "20px", fontWeight: "bold", color: "#15803d" }}>{matchResult.matched} / {matchResult.total}</div>
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
            <strong style={{ fontSize: "14px", color: "#64748b", display: "block", marginBottom: "4px", textAlign: "right" }}>تفاصيل النطق:</strong>
            {matchResult.wordScores.map((w, idx) => (
              <div key={idx} className={`wordScoreRow ${w.isCorrect ? "correct" : "incorrect"}`} style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 16px",
                borderRadius: "10px",
                background: w.isCorrect ? "#f0fdf4" : "#fef2f2",
                border: w.isCorrect ? "1px solid #bbf7d0" : "1px solid #fecaca",
                direction: "rtl"
              }}>
                <span className="wordExpected" style={{
                  fontSize: "16px",
                  fontWeight: "bold",
                  color: w.isCorrect ? "#15803d" : "#b91c1c"
                }}>{w.expected}</span>
                
                <span style={{ fontSize: "12px", color: "#94a3b8" }}>⬅️</span>
                
                <span className="wordBestMatch" style={{
                  fontSize: "15px",
                  color: w.isCorrect ? "#166534" : "#991b1b",
                  fontStyle: w.bestMatch ? "normal" : "italic"
                }}>{w.bestMatch || "(لم تُنطق)"}</span>
                
                <span className="wordStatusIcon" style={{ fontSize: "16px" }}>{w.isCorrect ? "🟢" : "🔴"}</span>
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
              onClick={handleDoneSubmit}
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
              onClick={() => setPhase("fallback")}
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
 * Compare transcription text against expected words using fuzzy matching.
 * Returns { accuracy, matched, missed, total, wordScores[] }
 */
function compareWords(transcription, expectedWords) {
  const transcribedTokens = normalizeArabic(transcription)
    .split(/\s+/)
    .filter(Boolean);

  const wordScores = expectedWords.map((expected) => {
    const normalizedExpected = normalizeArabic(expected);
    // Find best matching token in transcription
    let bestScore = 0;
    let bestMatch = "";
    for (const token of transcribedTokens) {
      const score = fuzzyScore(token, normalizedExpected);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = token;
      }
    }
    return {
      expected,
      bestMatch,
      score: bestScore,
      isCorrect: bestScore >= 70, // 70% threshold for fuzzy match
    };
  });

  const matched = wordScores.filter((w) => w.isCorrect).length;
  const total = expectedWords.length;
  const accuracy = total > 0 ? (matched / total) * 100 : 0;

  return { accuracy, matched, missed: total - matched, total, wordScores };
}

export default SpeechReading;
