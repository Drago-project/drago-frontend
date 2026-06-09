import React, { useState } from "react";
import { Choice } from "./Choice.jsx";

export function VisualMemory({ item, onFinish }) {
  const [selected, setSelected] = useState("");
  const [showStimulus, setShowStimulus] = useState(false);
  const [stimulusSeen, setStimulusSeen] = useState(false);

  function reveal() {
    setShowStimulus(true);
    setStimulusSeen(true);
    setTimeout(() => {
      setShowStimulus(false);
    }, item.exposureMs || 3000);
  }

  function handleSubmit(value) {
    onFinish(value === item.correctAnswer ? 100 : 0, value);
  }

  return (
    <>
      <div className="memory" aria-live="polite">
        {!stimulusSeen && (
          <button
            type="button"
            className="secondary"
            onClick={reveal}
            aria-label="إظهار الكلمة لحفظها"
          >
            إظهار الكلمة
          </button>
        )}
        {showStimulus && (
          <strong aria-label={`الكلمة المطلوب حفظها هي: ${item.stimulus}`}>
            {item.stimulus}
          </strong>
        )}
        {stimulusSeen && !showStimulus && (
          <span aria-live="assertive">اختار الكلمة التي ظهرت</span>
        )}
      </div>
      {stimulusSeen && !showStimulus && (
        <Choice
          choices={item.choices}
          selected={selected}
          onSelect={setSelected}
          onSubmit={handleSubmit}
        />
      )}
    </>
  );
}
