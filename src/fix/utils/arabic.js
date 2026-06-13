import { clamp } from "./scoring.js";

export function normalizeArabic(value) {
  return String(value || "")
    .trim()
    .replace(/[\u064B-\u065F\u0670]/g, "")
    .replace(/ـ/g, "")
    .replace(/[إأآا]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/\s+/g, " ");
}

export function levenshtein(a, b) {
  const s = normalizeArabic(a).replace(/\s/g, "");
  const t = normalizeArabic(b).replace(/\s/g, "");
  const dp = Array.from({ length: s.length + 1 }, () => Array(t.length + 1).fill(0));
  for (let i = 0; i <= s.length; i++) dp[i][0] = i;
  for (let j = 0; j <= t.length; j++) dp[0][j] = j;
  for (let i = 1; i <= s.length; i++) {
    for (let j = 1; j <= t.length; j++) {
      const cost = s[i - 1] === t[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  return dp[s.length][t.length];
}

export function fuzzyScore(answer, correct) {
  const a = normalizeArabic(answer).replace(/\s/g, "");
  const b = normalizeArabic(correct).replace(/\s/g, "");
  if (!a || !b) return 0;
  return clamp((1 - levenshtein(a, b) / Math.max(a.length, b.length)) * 100);
}
