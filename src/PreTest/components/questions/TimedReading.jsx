import React, { useState } from "react";
import { useTimer } from "../../hooks/useTimer.js";
import { useAudioRecorder } from "../../hooks/useAudioRecorder.js";
import { AppTimer } from "../ui/AppTimer.jsx";
import { Choice } from "./Choice.jsx";
import { normalizeArabic, fuzzyScore } from "../../utils/arabic.js";
import { transcribeAudio } from "../../utils/speechToText.js";

/**
 * TimedReading — sentence reading with STT + comprehension question.
 *
 * Flow:
 *  1. Show sentence → child presses Start → timer + mic begin
 *  2. Child reads aloud → presses "انتهيت" → recording stops
 *  3. Audio sent to HF model → reading accuracy calculated
 *  4. Comprehension MCQ shown → child answers
 *  5. Combined score (reading accuracy + comprehension) submitted
 */
export function TimedReading({ item, onFinish }) {
  const { elapsed, started, start, stop } = useTimer();
  const recorder = useAudioRecorder();

  const [readingDone, setReadingDone] = useState(false);
  const [selected, setSelected] = useState("");

  // STT-specific state
  // "idle" | "recording" | "processing" | "comprehension"
  const [phase, setPhase] = useState("idle");
  const [readingAccuracy, setReadingAccuracy] = useState(null);
  const [transcription, setTranscription] = useState("");
  const [sttError, setSttError] = useState(null);

  async function handleStart() {
    start();
    try {
      await recorder.start();
      setPhase("recording");
    } catch {
      // Mic not available → just do timed reading without STT
      setPhase("recording");
    }
  }

  async function handleStopReading() {
    stop();
    setPhase("processing");

    try {
      const blob = await recorder.stop();
      if (blob) {
        const text = await transcribeAudio(blob, item.text);
        setTranscription(text);

        // Calculate reading accuracy by comparing transcription to expected text
        const accuracy = fuzzyScore(text, item.text);
        setReadingAccuracy(accuracy);
      }
    } catch (err) {
      console.warn("STT failed in TimedReading:", err);
      setSttError(err.message);
      // Continue to comprehension even if STT fails
    }

    setReadingDone(true);
    setPhase("comprehension");
  }

  function handleSubmit(value) {
    const used = elapsed;
    const correct =
      normalizeArabic(value) === normalizeArabic(item.correctAnswer);
    const comprehensionScore = correct ? 100 : 0;

    // Blend reading accuracy with comprehension if we have STT data
    let finalScore;
    if (readingAccuracy !== null) {
      // 40% reading accuracy + 60% comprehension
      finalScore = readingAccuracy * 0.4 + comprehensionScore * 0.6;
    } else {
      finalScore = comprehensionScore;
    }

    onFinish(finalScore, value, {
      elapsedMs: used,
      comprehensionCorrect: correct,
      comprehensionScore,
      readingAccuracy,
      transcription: transcription || null,
      sttError: sttError || null,
      mode: readingAccuracy !== null ? "automatic" : "manual",
    });
  }

  return (
    <>
      {/* Sentence to read — visible until reading is done */}
      {!readingDone && (
        <div className="reading" aria-label="النص المقروء">
          {item.text}
        </div>
      )}

      {/* Start / Recording controls */}
      {phase === "idle" && (
        <div className="speechControls">
          <p className="hint">🎤 اضغط ابدأ ثم اقرأ الجملة بصوت واضح</p>
          <AppTimer
            elapsed={elapsed}
            started={false}
            onStart={handleStart}
            onStop={() => {}}
          />
        </div>
      )}

      {phase === "recording" && (
        <div className="speechControls">
          <AppTimer
            elapsed={elapsed}
            started={started}
            onStart={() => {}}
            onStop={handleStopReading}
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

      {/* Comprehension question — shown after reading */}
      {phase === "comprehension" && (
        <div aria-live="assertive">
          {readingAccuracy !== null && (
            <p className="readingScore">
              📖 دقة القراءة: {Math.round(readingAccuracy)}%
            </p>
          )}
          <h4 style={{ fontSize: "20px", marginBottom: "14px" }}>
            {item.question}
          </h4>
          <Choice
            choices={item.choices}
            selected={selected}
            onSelect={setSelected}
            onSubmit={handleSubmit}
          />
        </div>
      )}
    </>
  );
}
export default TimedReading;
