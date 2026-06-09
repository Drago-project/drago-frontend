import { useEffect, useState } from "react";
import { SAVE_KEY } from "../data/flow.js";

export function useLocalStorage(states, setters) {
  const [hasSaved, setHasSaved] = useState(false);

  useEffect(() => {
    setHasSaved(Boolean(localStorage.getItem(SAVE_KEY)));
  }, []);

  useEffect(() => {
    // Prevent saving if it's the initial/default empty state to avoid overwriting prior saves
    if (states.step === 0 && states.responses.length === 0 && !states.intake.childName) {
      return;
    }

    const handler = setTimeout(() => {
      const payload = {
        ...states,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
      setHasSaved(true);
    }, 500);

    return () => clearTimeout(handler);
  }, Object.values(states));

  function restoreSaved() {
    try {
      const saved = JSON.parse(localStorage.getItem(SAVE_KEY));
      if (!saved) return null;

      Object.keys(setters).forEach((key) => {
        if (saved[key] !== undefined) {
          setters[key](saved[key]);
        }
      });
      return saved;
    } catch {
      localStorage.removeItem(SAVE_KEY);
      setHasSaved(false);
      return null;
    }
  }

  function clearSaved() {
    localStorage.removeItem(SAVE_KEY);
    setHasSaved(false);
  }

  return { restoreSaved, clearSaved, hasSaved };
}
