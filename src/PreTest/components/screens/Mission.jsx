import React, { useState } from "react";
import { Question } from "../questions/Question.jsx";
import { Rest } from "../ui/Rest.jsx";
import { missionMeta } from "../../data/flow.js";
import { questions } from "../../data/questions.js";

export function Mission({ id, index, onAnswer, onBack, viewMode }) {
  const [resting, setResting] = useState(false);
  const meta = missionMeta[id];
  const item = questions[id]?.[index];

  if (!item || !meta) {
    return <p style={{ textAlign: "center" }}>جاري تحميل النشاط...</p>;
  }

  const moduleQuestionsLength = questions[id].length;

  return (
    <section className="card mission">
      <div className="missionHead">
        <div>
          <span className="missionTag">
            {viewMode === "child" ? meta.title : meta.domain}
          </span>
          <h2>{index === 0 ? meta.intro : "نشاط جديد"}</h2>
        </div>
        <div className="bubble" aria-label={`السؤال ${index + 1} من ${moduleQuestionsLength}`}>
          {index + 1}/{moduleQuestionsLength}
        </div>
      </div>
      <div
        className="miniProgress"
        role="progressbar"
        aria-valuenow={Math.round((index / moduleQuestionsLength) * 100)}
        aria-valuemin="0"
        aria-valuemax="100"
      >
        <i style={{ width: `${(index / moduleQuestionsLength) * 100}%` }} />
      </div>
      
      {resting ? (
        <Rest onResume={() => setResting(false)} />
      ) : (
        <Question
          key={item.id}
          item={item}
          moduleId={id}
          onAnswer={onAnswer}
          viewMode={viewMode}
        />
      )}
      
      <div className="row footerActions" style={{ justifyContent: "center" }}>
        <button
          type="button"
          className="secondary"
          onClick={() => setResting(true)}
          aria-label="أخذ استراحة قصيرة"
        >
          استراحة
        </button>
      </div>
    </section>
  );
}
export default Mission;
