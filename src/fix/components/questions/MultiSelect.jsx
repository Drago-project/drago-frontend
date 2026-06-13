import React from "react";

export function MultiSelect({ grid, selected = [], onToggle, onSubmit }) {
  return (
    <>
      <div className="letterGrid" role="group" aria-label="شبكة الحروف">
        {grid.map((x, i) => {
          const isPressed = selected.includes(i);
          return (
            <button
              key={i}
              type="button"
              className={isPressed ? "selected" : ""}
              onClick={() => onToggle(i)}
              aria-pressed={isPressed}
              aria-label={`حرف ${x}`}
            >
              {x}
            </button>
          );
        })}
      </div>
      <button
        type="button"
        className="primary"
        disabled={!selected.length}
        onClick={onSubmit}
      >
        تأكيد الصيد
      </button>
    </>
  );
}
