import React from "react";

export function OrderedTap({ choices, sequence = [], onAdd, onClear, onSubmit }) {
  return (
    <>
      <div
        className="sequence"
        aria-live="polite"
        aria-label={`تحديدك الحالي: ${sequence.length ? sequence.join(" ثم ") : "لا يوجد"}`}
      >
        اختيارك: <b>{sequence.length ? sequence.join(" ← ") : "ابدأ الضغط"}</b>
      </div>
      <div className="choices" role="group" aria-label="أزرار الترتيب">
        {choices.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => onAdd(c)}
            aria-label={`إضافة ${c}`}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="row">
        <button
          type="button"
          className="secondary"
          onClick={onClear}
          aria-label="مسح الاختيار الحالي"
        >
          مسح
        </button>
        <button
          type="button"
          className="primary"
          disabled={!sequence.length}
          onClick={onSubmit}
        >
          تأكيد
        </button>
      </div>
    </>
  );
}
