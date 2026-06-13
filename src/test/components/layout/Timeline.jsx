import React from "react";
import { flow } from "../../data/flow.js";

export function Timeline({ step }) {
  return (
    <aside className="side" role="navigation" aria-label="مسار التقييم">
      <h3>مسار التقييم</h3>
      {flow.map((s, i) => {
        const isActive = i === step;
        const isDone = i < step;
        return (
          <div
            key={s.id}
            className={`step ${isActive ? "active" : ""} ${isDone ? "done" : ""}`}
            aria-current={isActive ? "step" : undefined}
          >
            <b aria-hidden="true">{isDone ? "✓" : i + 1}</b>
            <span>{s.therapistTitle}</span>
          </div>
        );
      })}
    </aside>
  );
}
export default Timeline;
