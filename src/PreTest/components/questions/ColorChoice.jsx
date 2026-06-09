import React from "react";
import { speak } from "../../utils/speech.js";

export function ColorChoice({ choices, selected, onSelect, onSubmit }) {
  return (
    <>
      <div className="colors" role="radiogroup" aria-label="خيارات الألوان">
        {choices.map((c) => {
          const isSelected = selected === c.value;
          return (
            <button
              key={c.value}
              type="button"
              className={`colorBtn ${isSelected ? "selected" : ""}`}
              style={{ background: c.color, position: "relative" }}
              onClick={() => {
                onSelect(c.value);
                speak(c.value, { rate: 0.85 });
              }}
              role="radio"
              aria-checked={isSelected}
              aria-label={c.value}
            >
              {/* Listen button for color choice */}
              <span
                className="choiceSpeak"
                role="button"
                tabIndex={0}
                aria-label={`استمع لـ ${c.value}`}
                title="اسمع هذا الخيار"
                onClick={(e) => {
                  e.stopPropagation();
                  speak(c.value, { rate: 0.8 });
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.stopPropagation();
                    speak(c.value, { rate: 0.8 });
                  }
                }}
              >
                🔉
              </span>
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
