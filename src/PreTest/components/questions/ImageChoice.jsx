import React from "react";
import { speak } from "../../utils/speech.js";

export function ImageChoice({ choices, selected, onSelect, onSubmit }) {
  return (
    <>
      <div className="imageChoices" role="radiogroup" aria-label="خيارات الصور">
        {choices.map((c) => {
          const isSelected = selected === c.value;
          return (
            <button
              key={c.value}
              type="button"
              className={`choiceBtn ${isSelected ? "selected" : ""}`}
              onClick={() => {
                onSelect(c.value);
                // Speak the image label so children know what they tapped
                speak(c.label, { rate: 0.85 });
              }}
              role="radio"
              aria-checked={isSelected}
              aria-label={c.label}
            >
              {/* Listen button for each image choice */}
              <span
                className="choiceSpeak"
                role="button"
                tabIndex={0}
                aria-label={`استمع لـ ${c.label}`}
                title="اسمع هذا الخيار"
                onClick={(e) => {
                  e.stopPropagation();
                  speak(c.label, { rate: 0.8 });
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.stopPropagation();
                    speak(c.label, { rate: 0.8 });
                  }
                }}
              >
                🔉
              </span>
              <div className="emojiCard" aria-hidden="true">
                {c.icon}
              </div>
              <b className="choiceText">{c.label}</b>
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

