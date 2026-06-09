export function clamp(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function avg(values) {
  const clean = values.filter(Number.isFinite);
  if (!clean.length) return null;
  return Math.round(clean.reduce((a, b) => a + b, 0) / clean.length);
}

export function expectedTime(item) {
  const base = {
    choice: 4500,
    imageChoice: 4200,
    colorChoice: 3200,
    orderedTap: 6500,
    multiSelect: 9000,
    visualMemory: 7000,
    memorySpan: 9500,
    textInput: 11000,
    timedReading: item.idealTimeMs || 12000,
    timedNaming: item.idealTimeMs || 9000,
    reactionChoice: item.idealTimeMs || 1800,
    speechReading: item.idealTimeMs || 8000,
  };
  return base[item.type] || 6000;
}

export function adaptiveScore(item, accuracyScore, responseTimeMs, extra = {}) {
  const speedScore = clamp((expectedTime(item) / Math.max(1, responseTimeMs)) * 100);
  const difficultyBonus = Math.max(0, (item.difficulty || 1) - 1) * 3;
  const weights = {
    rapidNaming: { accuracy: 0.55, speed: 0.45 },
    decoding: { accuracy: 0.75, speed: 0.25 },
    spellingMemory: { accuracy: 0.85, speed: 0.15 },
    orthographic: { accuracy: 0.8, speed: 0.2 },
    phonological: { accuracy: 0.9, speed: 0.1 },
    spokenLanguage: { accuracy: 0.85, speed: 0.15 },
  };
  const w = weights[item.domain] || { accuracy: 0.8, speed: 0.2 };
  let score = accuracyScore * w.accuracy + speedScore * w.speed + difficultyBonus;

  if (extra.errorCount) score -= extra.errorCount * 8;
  if (extra.falsePositiveCount) score -= extra.falsePositiveCount * 10;
  if (extra.missingCount) score -= extra.missingCount * 8;

  return {
    score: clamp(score),
    accuracyScore: clamp(accuracyScore),
    speedScore,
    difficultyBonus,
    weights: w,
    adaptiveVersion: "v2-domain-speed-difficulty",
  };
}

export function parentRisk(intake) {
  let risk = 0;
  if (intake.familyHistory === "yes") risk += 25;
  if (intake.avoidsReading === "yes") risk += 25;
  if (intake.spellingStruggle === "yes") risk += 25;
  if (intake.slowReading === "yes") risk += 25;
  return risk;
}

export function computeResults(responses, safety, intake) {
  const domains = ["spokenLanguage", "phonological", "orthographic", "rapidNaming", "decoding", "spellingMemory"];
  const domainScores = Object.fromEntries(
    domains.map((d) => [d, avg(responses.filter((r) => r.domain === d).map((r) => r.score))])
  );

  const skillScores = {};
  responses.forEach((r) => {
    skillScores[r.skill] ||= [];
    skillScores[r.skill].push(r.score);
  });
  Object.keys(skillScores).forEach((k) => (skillScores[k] = avg(skillScores[k])));

  const core = [
    domainScores.phonological,
    domainScores.orthographic,
    domainScores.rapidNaming,
    domainScores.decoding,
    domainScores.spellingMemory,
  ].filter((x) => x !== null);
  const coreScore = avg(core) ?? 0;
  const questionnaireRisk = parentRisk(intake);
  const overall = clamp(coreScore * 0.9 + (100 - questionnaireRisk) * 0.1);
  const weakDomains = Object.entries(domainScores)
    .filter(([d, s]) => d !== "spokenLanguage" && s !== null && s < 60)
    .map(([d]) => d);

  const flags = [];
  if (safety.hearingIssue) flags.push("ملاحظة سمعية قد تؤثر على أنشطة الصوت.");
  if (safety.visionIssue) flags.push("ملاحظة بصرية قد تؤثر على أنشطة الصور والحروف.");
  if (safety.tiredToday) flags.push("الطفل مرهق اليوم؛ يفضل إعادة التجربة لاحقًا للتأكيد.");
  if (safety.attentionIssue) flags.push("تشتت الانتباه قد يؤثر على السرعة والدقة.");
  if (!safety.understandsTask) flags.push("فهم التعليمات غير مؤكد؛ فسّر النتيجة بحذر.");

  let risk = "منخفض";
  if (overall < 45 || weakDomains.length >= 3) risk = "مرتفع";
  else if (overall < 65 || weakDomains.length >= 2) risk = "متوسط";

  return { domainScores, skillScores, weakDomains, flags, overall, risk, questionnaireRisk };
}

export function makePlan(scores) {
  const map = {
    phonological: ["مغامرة الأصوات", "ألعاب القافية، بداية الصوت، الدمج، والحذف"],
    orthographic: ["مغامرة الحروف", "تمييز النقاط، الحركات، البحث البصري، والحروف المتشابهة"],
    rapidNaming: ["مغامرة السرعة", "تسمية الصور، الألوان، الأرقام، والحروف بمؤقت لطيف"],
    decoding: ["مغامرة القراءة", "حرف-صوت، مقاطع، كلمات تدريبية، ثم جمل قصيرة"],
    spellingMemory: ["مغامرة الذاكرة", "بناء كلمات، إملاء، ترتيب أصوات، وذاكرة قصيرة"],
  };
  const plan = Object.entries(map)
    .filter(([domain]) => (scores[domain] ?? 100) < 60)
    .map(([domain, [title, game]]) => ({
      domain,
      title,
      game,
      level: scores[domain] < 40 ? 1 : 2,
    }));
  return plan.length
    ? plan
    : [
        {
          domain: "balanced",
          title: "رحلة متوازنة",
          game: "ابدأ بمستوى متوسط في كل الألعاب وأعد التقييم بعد 10 جلسات",
          level: 3,
        },
      ];
}
