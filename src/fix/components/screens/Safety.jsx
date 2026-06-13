import React from "react";
import { Check } from "../ui/Check.jsx";
import { Title } from "../ui/Title.jsx";

export function Safety({ safety, setSafety, onNext, onBack }) {
  const items = [
    ["hearingIssue", "يوجد صعوبة في السمع أو الصوت غير واضح"],
    ["visionIssue", "يوجد صعوبة في رؤية الشاشة أو الحروف"],
    ["tiredToday", "الطفل مرهق أو متوتر اليوم"],
    ["attentionIssue", "يوجد تشتت انتباه واضح"],
  ];

  return (
    <section className="card">
      <Title
        tag="تجهيز"
        title="قبل ما نبدأ"
        text="خلّي الصوت واضح والشاشة مريحة. لو فيه ملاحظة، سنأخذها في التقرير."
      />
      <div className="checks" role="group" aria-label="فحص السلامة البيئية والجسدية">
        {items.map(([key, label]) => (
          <Check
            key={key}
            checked={safety[key]}
            onChange={(v) => setSafety({ ...safety, [key]: v })}
          >
            {label}
          </Check>
        ))}
        <Check
          checked={safety.understandsTask}
          onChange={(v) => setSafety({ ...safety, understandsTask: v })}
        >
          الطفل فاهم فكرة الاختيار والضغط
        </Check>
      </div>
      <div className="row" style={{ justifyContent: "center" }}>
        <button
          type="button"
          className="primary big"
          onClick={onNext}
          aria-label="ابدأ رحلة التقييم"
          style={{ width: "240px" }}
        >
          ابدأ الرحلة
        </button>
      </div>
    </section>
  );
}
export default Safety;
