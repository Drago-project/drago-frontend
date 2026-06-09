export const SAVE_KEY = "arabic_dyslexia_gamified_pretest_state_v2";

export const intakeDefaults = {
  childName: "",
  age: "",
  grade: "",
  assessorRole: "parent",
  familyHistory: "unknown",
  avoidsReading: "unknown",
  spellingStruggle: "unknown",
  slowReading: "unknown",
};

export const safetyDefaults = {
  hearingIssue: false,
  visionIssue: false,
  tiredToday: false,
  attentionIssue: false,
  understandsTask: true,
};

export const flow = [
  { id: "welcome", kind: "welcome", childTitle: "Drago", therapistTitle: "بداية التقييم" },
  { id: "onboarding", kind: "onboarding", childTitle: "بطاقة البداية", therapistTitle: "بيانات الطفل" },
  { id: "safety", kind: "safety", childTitle: "تجهيز الرحلة", therapistTitle: "فحص السمع والنظر" },
  { id: "calibration", kind: "module", childTitle: "مهمة الاستماع", therapistTitle: "معايرة اللغة" },
  { id: "phonological", kind: "module", childTitle: "مهمة الأصوات", therapistTitle: "الوعي الصوتي" },
  { id: "orthographic", kind: "module", childTitle: "مهمة الحروف", therapistTitle: "الحروف والأشكال" },
  { id: "rapidNaming", kind: "module", childTitle: "مهمة السرعة", therapistTitle: "سرعة التسمية" },
  { id: "decoding", kind: "module", childTitle: "مهمة القراءة", therapistTitle: "القراءة وفك التشفير" },
  { id: "spellingMemory", kind: "module", childTitle: "مهمة الذاكرة", therapistTitle: "الإملاء والذاكرة" },
  { id: "results", kind: "results", childTitle: "خريطة Drago", therapistTitle: "التقرير والخطة" },
];

export const missionMeta = {
  calibration: { domain: "spokenLanguage", title: "مهمة الاستماع", intro: "اسمع التعليمات واختار الإجابة المناسبة." },
  phonological: { domain: "phonological", title: "مهمة الأصوات", intro: "هنلعب مع بداية الصوت، آخر الصوت، القافية، والدمج." },
  orthographic: { domain: "orthographic", title: "مهمة الحروف", intro: "اصطد الحروف والأشكال المتشابهة بدقة." },
  rapidNaming: { domain: "rapidNaming", title: "مهمة السرعة", intro: "سمّي العناصر بسرعة وهدوء." },
  decoding: { domain: "decoding", title: "مهمة القراءة", intro: "اقرأ واختار الإجابة المناسبة." },
  spellingMemory: { domain: "spellingMemory", title: "مهمة الذاكرة", intro: "اكتب، رتّب، واحفظ تسلسلات قصيرة." },
};
