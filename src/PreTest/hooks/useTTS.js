import { useState, useEffect, useCallback, useRef } from "react";
import { speak, stop, isTTSAvailable, speakSequence } from "../utils/speech.js";

/**
 * useTTS — React hook for Text-to-Speech
 *
 * @param {string | string[]} [text]  Text (or array of words) to auto-speak when changed
 * @param {{ autoPlay?: boolean, rate?: number, pitch?: number, delay?: number }} [options]
 *
 * Returns:
 *   speakText(text, opts?)  — imperatively speak any text
 *   speakWords(words, opts?) — imperatively speak a word sequence
 *   stopSpeech()            — stop immediately
 *   isSpeaking              — boolean state
 *   isSupported             — boolean, false if no speechSynthesis
 */
export function useTTS(text, options = {}) {
  const { autoPlay = true, rate = 0.82, pitch = 1.0, delay = 150 } = options;

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported] = useState(() => isTTSAvailable());
  const cancelSeqRef = useRef(null);

  // ── Imperative speak ──────────────────────────────────────────────────────
  const speakText = useCallback((t, opts = {}) => {
    if (!t) return;
    setIsSpeaking(true);
    speak(t, {
      rate: opts.rate ?? rate,
      pitch: opts.pitch ?? pitch,
      onStart: () => setIsSpeaking(true),
      onEnd:   () => setIsSpeaking(false),
    });
  }, [rate, pitch]);

  const speakWords = useCallback((words, opts = {}) => {
    if (!words || !words.length) return;
    setIsSpeaking(true);
    if (cancelSeqRef.current) cancelSeqRef.current();
    cancelSeqRef.current = speakSequence(words, {
      rate: opts.rate ?? rate,
      pauseMs: opts.pauseMs ?? 600,
    });
    // Approximate duration — mark done after all words + pauses
    const approxMs = words.length * 1400 + (words.length - 1) * 600;
    setTimeout(() => setIsSpeaking(false), approxMs);
  }, [rate]);

  const stopSpeech = useCallback(() => {
    if (cancelSeqRef.current) { cancelSeqRef.current(); cancelSeqRef.current = null; }
    stop();
    setIsSpeaking(false);
  }, []);

  // ── Auto-play when `text` changes ─────────────────────────────────────────
  useEffect(() => {
    if (!autoPlay || !text || !isSupported) return;
    const timer = setTimeout(() => {
      if (Array.isArray(text)) {
        speakWords(text);
      } else {
        speakText(text);
      }
    }, delay);
    return () => { clearTimeout(timer); };
  }, [text, autoPlay, isSupported]); // eslint-disable-line

  // Cleanup on unmount
  useEffect(() => () => {
    stopSpeech();
  }, []); // eslint-disable-line

  return { speakText, speakWords, stopSpeech, isSpeaking, isSupported };
}
