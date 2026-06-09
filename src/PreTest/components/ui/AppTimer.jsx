import React from "react";

export function AppTimer({ elapsed, started, onStart, onStop, stopText = "إيقاف" }) {
  return (
    <div className="timer">
      <div>
        <span>الوقت</span>
        <b aria-live="polite">{(elapsed / 1000).toFixed(1)}s</b>
      </div>
      {!started ? (
        <button
          type="button"
          className="primary"
          onClick={onStart}
          aria-label="ابدأ المؤقت"
        >
          ابدأ
        </button>
      ) : (
        <button
          type="button"
          className="secondary"
          onClick={onStop}
          aria-label={`${stopText} المؤقت`}
        >
          {stopText}
        </button>
      )}
    </div>
  );
}
export default AppTimer;
