import React from "react";
import { Field } from "../ui/Field.jsx";
import { AppSelect } from "../ui/AppSelect.jsx";
import { Title } from "../ui/Title.jsx";

export function Onboarding({ intake, setIntake, onNext }) {
  const ageNum = Number(intake.age);
  const ok = intake.childName.trim() && intake.age && ageNum >= 3 && ageNum <= 18;
  
  const yn = [
    ["unknown", "غير معروف"],
    ["yes", "نعم"],
    ["no", "لا"],
  ];

  return (
    <section className="card">
      <Title
        tag="بطاقة"
        title="بطاقة البداية"
        text="بيانات بسيطة تساعدنا نفهم الرحلة بشكل أفضل."
      />
      <div className="grid2">
        <Field
          label="اسم الطفل"
          value={intake.childName}
          onChange={(v) => setIntake({ ...intake, childName: v })}
          placeholder="مثال: آدم"
          required
        />
        <Field
          label="العمر (من 3 إلى 18 سنة)"
          type="number"
          value={intake.age}
          onChange={(v) => setIntake({ ...intake, age: v })}
          placeholder="مثال: 8"
          min={3}
          max={18}
          required
        />
        <Field
          label="الصف الدراسي"
          value={intake.grade}
          onChange={(v) => setIntake({ ...intake, grade: v })}
          placeholder="مثال: الصف الثالث"
        />
        <AppSelect
          label="صفة المقيم"
          value={intake.assessorRole}
          onChange={(v) => setIntake({ ...intake, assessorRole: v })}
          options={[
            ["parent", "ولي أمر"],
            ["therapist", "أخصائي"],
            ["teacher", "مدرس"],
          ]}
        />
        <AppSelect
          label="تاريخ عائلي لصعوبات القراءة؟"
          value={intake.familyHistory}
          onChange={(v) => setIntake({ ...intake, familyHistory: v })}
          options={yn}
        />
        <AppSelect
          label="هل الطفل يتجنب القراءة؟"
          value={intake.avoidsReading}
          onChange={(v) => setIntake({ ...intake, avoidsReading: v })}
          options={yn}
        />
        <AppSelect
          label="هل يعاني في الإملاء؟"
          value={intake.spellingStruggle}
          onChange={(v) => setIntake({ ...intake, spellingStruggle: v })}
          options={yn}
        />
        <AppSelect
          label="هل يقرأ ببطء؟"
          value={intake.slowReading}
          onChange={(v) => setIntake({ ...intake, slowReading: v })}
          options={yn}
        />
      </div>
      <button
        type="button"
        className="primary"
        disabled={!ok}
        onClick={onNext}
        aria-label="الانتقال للمهمة التالية"
      >
        جاهز للمهمة
      </button>
    </section>
  );
}
export default Onboarding;
