import { avg } from "./scoring.js";

export function adaptiveNextIndex({ questionList, currentIndex, moduleResponses }) {
  const current = questionList[currentIndex];
  const recent2 = moduleResponses.slice(-2);
  const recent3 = moduleResponses.slice(-3);
  const recentAvg = avg(recent3.map((r) => r.score)) ?? 0;
  const currentDifficulty = current?.difficulty || 1;

  if (moduleResponses.length >= 4 && (recentAvg >= 90 || recentAvg < 35)) {
    return {
      stop: true,
      reason: recentAvg >= 90 ? "high_confidence_strong" : "high_confidence_needs_support",
    };
  }

  let nextIndex = currentIndex + 1;

  if (recent2.length === 2 && recent2.every((r) => r.score >= 85)) {
    const harder = questionList.findIndex(
      (q, i) => i > currentIndex && (q.difficulty || 1) > currentDifficulty
    );
    if (harder !== -1) nextIndex = harder;
  }

  if (recent2.length === 2 && recent2.every((r) => r.score < 50)) {
    const easier = questionList.findIndex(
      (q, i) => i > currentIndex && (q.difficulty || 1) <= currentDifficulty
    );
    if (easier !== -1) nextIndex = easier;
  }

  if (nextIndex >= questionList.length) return { stop: true, reason: "module_finished" };
  return { stop: false, nextIndex, reason: "continue" };
}
