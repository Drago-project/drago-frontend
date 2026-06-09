import React from "react";
import { Feature } from "../ui/Feature.jsx";
import { Notice } from "../ui/Notice.jsx";
import dragoWave from "../../assets/drago/drago-wave.svg";
import webLogo from "../../assets/drago/web-logo.png";

export function Welcome({ onNext, hasSaved, onResume, onClearSaved }) {
  function handleClearSaved() {
    if (window.confirm("هل أنت متأكد من مسح الحفظ؟ ستفقد التقدم الحالي.")) {
      onClearSaved();
    }
  }

  return (
    <section className="card intro">
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "24px" }}>
        <img src={webLogo} alt="Drago Logo" style={{ height: "65px", objectFit: "contain" }} />
      </div>
      <div className="guide">
        <div className="dragon" aria-hidden="true" style={{ overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", background: "none", border: "none", boxShadow: "none" }}>
          <img src={dragoWave} alt="Drago Waving" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
        </div>
        <div>
          <h2>أهلًا، أنا Drago!</h2>
          <p>
            هنعمل شوية أنشطة قصيرة بالصور، الحروف، الأصوات، والذاكرة. اجمع نجوم وكمل
            الرحلة براحتك.
          </p>
        </div>
      </div>
      <div className="featureGrid">
        <Feature icon="🎧" title="اسمع" text="تعليمات قصيرة وواضحة." />
        <Feature icon="🧩" title="العب" text="اختيارات، ترتيب، صيد حروف، وسرعة." />
        <Feature icon="⭐" title="اجمع نجوم" text="تشجيع بعد كل نشاط." />
      </div>
      <Notice warn>
        هذه الرحلة للفرز والتوجيه التدريبي فقط، وليست تشخيصًا طبيًا نهائيًا.
      </Notice>
      <div className="row">
        <button
          type="button"
          className="primary big"
          onClick={onNext}
          aria-label="ابدأ رحلة التقييم"
        >
          ابدأ الرحلة
        </button>
        {hasSaved && (
          <button
            type="button"
            className="secondary"
            onClick={onResume}
            aria-label="استكمال الجلسة السابقة"
          >
            استكمال السابق
          </button>
        )}
        {hasSaved && (
          <button
            type="button"
            className="ghost"
            onClick={handleClearSaved}
            aria-label="مسح الجلسة السابقة والبدء من جديد"
          >
            مسح الحفظ
          </button>
        )}
      </div>
    </section>
  );
}
export default Welcome;
