import React, { useState } from "react";
import { normalizeArabic } from "../../utils/arabic.js";
import { useTTS } from "../../hooks/useTTS.js";
import { TTSButton } from "../ui/TTSButton.jsx";

export function MemorySpan({ item, onFinish }) {
  const [text, setText] = useState("");
  const [showStimulus, setShowStimulus] = useState(false);
  const [stimulusSeen, setStimulusSeen] = useState(false);

  // TTS for the sequence — spoken word-by-word during reveal
  const { speakWords, stopSpeech, isSpeaking, isSupported } = useTTS(null, {
    autoPlay: false,
  });

  function reveal() {
    setShowStimulus(true);
    setStimulusSeen(true);

    // Speak each word in the sequence with a pause between them
    speakWords(item.sequence, { rate: 0.72, pauseMs: 700 });

    setTimeout(() => {
      setShowStimulus(false);
    }, item.exposureMs || 3000);
  }

  function handleSubmit() {
    const typed = normalizeArabic(text).split(/[\s،,]+/).filter(Boolean);
    let points = 0;
    item.sequence.forEach((value, i) => {
      if (normalizeArabic(typed[i]) === normalizeArabic(value)) {
        points += 1;
      }
    });
    const extraPenalty = Math.max(0, typed.length - item.sequence.length) * 10;
    const score = Math.max(0, (points / item.sequence.length) * 100 - extraPenalty);
    onFinish(score, typed);
  }

  return (
    <>
      <div className="memory" aria-live="polite">
        {!stimulusSeen && (
          <button
            type="button"
            className="secondary"
            onClick={reveal}
            aria-label="عرض التسلسل لحفظه"
          >
            عرض التسلسل
          </button>
        )}

        {showStimulus && (
          <div className="memoryReveal">
            <strong aria-label={`التسلسل المطلوب حفظه هو: ${item.sequence.join(" ثم ")}`}>
              {item.sequence.join("  •  ")}
            </strong>
            {/* Live speaking indicator during sequence playback */}
            {isSpeaking && (
              <div className="memoryTtsRow">
                <TTSButton
                  text={null}
                  isSpeaking={isSpeaking}
                  onSpeak={() => {}}
                  onStop={stopSpeech}
                  isSupported={isSupported}
                  variant="icon"
                  size="sm"
                  label="يُقرأ التسلسل"
                />
                <span className="memoryTtsHint">جاري القراءة...</span>
              </div>
            )}
          </div>
        )}

        {stimulusSeen && !showStimulus && (
          <span aria-live="assertive">اكتب ما تتذكره بالترتيب</span>
        )}
      </div>

      <input
        className="answer"
        disabled={!stimulusSeen || showStimulus}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={item.placeholder || "مثال: كلمة كلمة كلمة"}
        aria-label="إجابتك للتسلسل"
        maxLength={100}
      />
      <button
        type="button"
        className="primary"
        disabled={!text.trim() || !stimulusSeen || showStimulus}
        onClick={handleSubmit}
      >
        تأكيد
      </button>
    </>
  );
}
