import React, { useMemo, useState } from "react";
import { computeResults, makePlan } from "../../utils/scoring.js";
import { Notice } from "../ui/Notice.jsx";
import dragoBack from "../../assets/drago/drago-back.svg";

export function Results({
  intake,
  safety,
  responses,
  stars,
  viewMode,
  onRestart,
  onFinish,
}) {
  const results = useMemo(
    () => computeResults(responses, safety, intake),
    [responses, safety, intake],
  );

  const plan = useMemo(
    () => makePlan(results.domainScores),
    [results.domainScores],
  );

  const [copied, setCopied] = useState(false);

  const labels = {
    spokenLanguage: "فهم التعليمات",
    phonological: "الأصوات",
    orthographic: "الحروف والأشكال",
    rapidNaming: "السرعة",
    decoding: "القراءة",
    spellingMemory: "الإملاء والذاكرة",
  };

  const payload = {
    assessmentType: "gamified_arabic_egyptian_pretest_v2",
    createdAt: new Date().toISOString(),
    intake,
    safety,
    stars,
    viewMode,
    ...results,
    therapyPlan: plan,
    responses,
    note: "Screening only. Not standalone diagnosis.",
  };

  async function copy() {
    try {
      await navigator.clipboard?.writeText(JSON.stringify(payload, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch (err) {
      console.error("Failed to copy JSON:", err);
    }
  }

  function downloadJSON() {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(payload, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);

    const dateStr = new Date().toISOString().slice(0, 10);
    const fileName = `drago_report_${intake.childName || "child"}_${dateStr}.json`;

    downloadAnchor.setAttribute("download", fileName);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  if (viewMode === "child") {
    return (
      <section className="card results">
        <div
          className="resultHero"
          style={{ alignItems: "center", gap: "20px" }}
        >
          <div
            className="dragon"
            aria-hidden="true"
            style={{
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "none",
              border: "none",
              boxShadow: "none",
              width: "110px",
              height: "110px",
              margin: "0",
              flexShrink: 0,
            }}
          >
            <img
              src={dragoBack}
              alt="Drago"
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          </div>
          <div style={{ flexGrow: 1 }}>
            <span className="missionTag">خريطة Drago</span>
            <h2>أحسنت يا {intake.childName || "بطل"}!</h2>
            <p>جمعت {stars} نجمة. سنبدأ لك رحلة تدريب مناسبة.</p>
          </div>
          <div className="scoreOrb" aria-label={`جمعت ${stars} نجوم`}>
            <b>⭐</b>
            <span>{stars}</span>
          </div>
        </div>

        <h3>المغامرات المقترحة</h3>
        <div className="plans">
          {plan.map((p, i) => (
            <div className="plan" key={p.domain}>
              <b>{i + 1}</b>
              <div>
                <h4>{p.title}</h4>
                <p>{p.game}</p>
              </div>
              <span>مستوى {p.level}</span>
            </div>
          ))}
        </div>

        <button
          type="button"
          className="primary"
          onClick={onRestart}
          aria-label="البدء في رحلة تقييم جديدة"
        >
          رحلة جديدة
        </button>
        {/* FINISH BUTTON FOR CHILD VIEW */}
        <button
          type="button"
          className="primary"
          onClick={onFinish}
          aria-label="إنهاء والذهاب للرئيسية"
        >
          إنهاء والذهاب للرئيسية
        </button>
      </section>
    );
  }

  return (
    <section className="card results">
      <div className="resultHero">
        <div>
          <span className="missionTag">تقرير الأخصائي</span>
          <h2>تقرير: {intake.childName || "بدون اسم"}</h2>
          <p>
            الدرجة العامة تستخدم دقة، سرعة، صعوبة السؤال، واستبيان ولي الأمر.
          </p>
        </div>
        <div
          className="scoreOrb"
          aria-label={`الدرجة الإجمالية ${results.overall} من 100`}
        >
          <b>{results.overall}</b>
          <span>/100</span>
        </div>
      </div>

      <Notice>
        مؤشر استبيان ولي الأمر: <b>{results.questionnaireRisk}%</b>. يستخدم
        كمعلومة مساعدة فقط.
      </Notice>

      {results.flags.length > 0 && (
        <Notice warn>
          {results.flags.map((f) => (
            <p key={f}>{f}</p>
          ))}
        </Notice>
      )}

      <div className="scoreGrid">
        {Object.entries(results.domainScores).map(([d, s]) => (
          <div className="scoreCard" key={d}>
            <h3>{labels[d]}</h3>
            <strong>{s ?? "—"}</strong>
            <div
              className="miniProgress"
              role="progressbar"
              aria-valuenow={s ?? 0}
              aria-valuemin="0"
              aria-valuemax="100"
            >
              <i style={{ width: `${s ?? 0}%` }} />
            </div>
          </div>
        ))}
      </div>

      <h3>المسارات العلاجية المقترحة</h3>
      <div className="plans">
        {plan.map((p, i) => (
          <div className="plan" key={p.domain}>
            <b>{i + 1}</b>
            <div>
              <h4>{p.title}</h4>
              <p>{p.game}</p>
            </div>
            <span>مستوى {p.level}</span>
          </div>
        ))}
      </div>

      <h3>أضعف المهارات التفصيلية</h3>
      <div
        className="chips"
        role="group"
        aria-label="المهارات التي تحتاج لتدريب"
      >
        {Object.entries(results.skillScores)
          .sort((a, b) => a[1] - b[1])
          .slice(0, 8)
          .map(([k, v]) => (
            <span key={k}>
              {k}: {v}
            </span>
          ))}
      </div>

      <details className="json">
        <summary>JSON للتخزين</summary>
        <pre>{JSON.stringify(payload, null, 2)}</pre>
      </details>

      <div className="row">
        <button
          type="button"
          className="secondary"
          onClick={onRestart}
          aria-label="إعادة إجراء التقييم بالكامل"
        >
          إعادة الرحلة
        </button>
        <button
          type="button"
          className="primary"
          onClick={copy}
          aria-label="نسخ تقرير JSON للحافظة"
        >
          {copied ? "تم النسخ" : "نسخ JSON"}
        </button>
        <button
          type="button"
          className="secondary"
          onClick={downloadJSON}
          aria-label="تحميل ملف تقرير JSON"
        >
          تحميل تقرير JSON
        </button>
        {/* FINISH BUTTON FOR THERAPIST VIEW */}
        <button
          type="button"
          className="primary"
          onClick={onFinish}
          aria-label="إنهاء والذهاب للرئيسية"
          style={{
            backgroundColor: "#4CAF50",
          }} /* Added a style just to make it pop, optional */
        >
          إنهاء والذهاب للرئيسية
        </button>
      </div>
    </section>
  );
}
export default Results;
