import React from "react";
import { speak } from "../../utils/speech.js";

export function Choice({ choices, selected, onSelect, onSubmit }) {
  return (
    <>
      <div className="choices" role="radiogroup" aria-label="خيارات الإجابة">
        {choices.map((c) => {
          const isSelected = selected === c;
          return (
            <button
              key={c}
              type="button"
              className={`choiceBtn${isSelected ? " selected" : ""}`}
              onClick={() => onSelect(c)}
              role="radio"
              aria-checked={isSelected}
              aria-label={c}
            >
              {/* Always-visible mini speaker per choice */}
              <span
                className="choiceSpeak"
                role="button"
                tabIndex={0}
                aria-label={`استمع لـ ${c}`}
                title="اسمع هذا الخيار"
                onClick={(e) => { e.stopPropagation(); speak(c, { rate: 0.8 }); }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.stopPropagation(); speak(c, { rate: 0.8 });
                  }
                }}
              >
                🔉
              </span>
              <span className="choiceText">{c}</span>
            </button>
          );
        })}
      </div>
      <button
        type="button"
        className="primary"
        disabled={!selected}
        onClick={() => onSubmit(selected)}
      >
        تأكيد
      </button>
    </>
  );
}
