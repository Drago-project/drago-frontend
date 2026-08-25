export const XP_DEBUG_KEY = "last_xp_award";

export function recordXpAttempt(payload, response) {
  try {
    const entry = { time: Date.now(), payload, response };
    localStorage.setItem(XP_DEBUG_KEY, JSON.stringify(entry));
  } catch (e) {
    // ignore
    console.warn("xpDebug record failed", e);
  }
}

export function readLastXpAttempt() {
  try {
    const s = localStorage.getItem(XP_DEBUG_KEY);
    return s ? JSON.parse(s) : null;
  } catch {
    return null;
  }
}

export function clearLastXpAttempt() {
  try {
    localStorage.removeItem(XP_DEBUG_KEY);
  } catch (e) {}
}
