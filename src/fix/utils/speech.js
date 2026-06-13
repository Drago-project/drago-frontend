/**
 * speech.js — Text-to-Speech utility
 * Supports:
 *   1. ElevenLabs API (premium neural voices, if VITE_ELEVENLABS_API_KEY is set in .env)
 *   2. Google Translate TTS (free cloud voice fallback)
 *   3. Web Speech API (local system voice fallback)
 */

const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;
// Default voice is Rachel (friendly, natural, supports Arabic beautifully)
const ELEVENLABS_VOICE_ID = import.meta.env.VITE_ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM"; 

let _bestVoice = null;
let currentAudio = null;

function pushLog(type, message, details = null) {
  if (typeof window === "undefined") return;
  window.__tts_errors = window.__tts_errors || [];
  window.__tts_errors.push({
    timestamp: new Date().toLocaleTimeString(),
    type,
    message,
    details
  });
}

/** Try to find any Arabic voice for local SpeechSynthesis fallback. */
function pickVoice() {
  if (_bestVoice) return _bestVoice;
  const voices = window.speechSynthesis?.getVoices() ?? [];

  // Prefer neural Arabic voices (order = best → fallback)
  const NAMES = ["majed", "laila", "hana", "naayf", "zariyah", "google arabic", "arabic"];
  const arabicVoices = voices.filter((v) => v.lang.startsWith("ar"));

  for (const name of NAMES) {
    const match = arabicVoices.find((v) => v.name.toLowerCase().includes(name));
    if (match) {
      _bestVoice = match;
      return match;
    }
  }
  if (arabicVoices.length) {
    _bestVoice = arabicVoices[0];
    return _bestVoice;
  }
  return null; // browser will use default
}

// Re-pick local voices after they load asynchronously
if (typeof window !== "undefined" && window.speechSynthesis) {
  window.speechSynthesis.onvoiceschanged = () => {
    _bestVoice = null;
    pickVoice();
  };
  pickVoice();
}

/** Local speech synthesis fallback */
function speakLocal(text, opts = {}) {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    if (opts.onEnd) opts.onEnd();
    return null;
  }

  const u = new SpeechSynthesisUtterance(text);
  u.lang = "ar-SA";
  u.rate = opts.rate ?? 0.82;
  u.pitch = opts.pitch ?? 1.0;

  const voice = pickVoice();
  if (voice) u.voice = voice;

  u.onend = () => {
    pushLog("Local Speech End", `Finished speaking: "${text.substring(0, 30)}..."`);
    if (opts.onEnd) opts.onEnd();
  };

  u.onerror = (e) => {
    console.error("Local SpeechSynthesisUtterance error:", e);
    pushLog("Local Speech Error", `Synthesizer error: ${e.error || "failed"}`, { errorType: e.type, code: e.code });
    if (opts.onEnd) opts.onEnd();
  };

  try {
    pushLog("Local Speech Start", `Attempting local speech synthesis: "${text.substring(0, 30)}..."`);
    window.speechSynthesis.speak(u);
  } catch (err) {
    console.error("Local SpeechSynthesis speak failed:", err);
    pushLog("Local Speech Exception", err.message);
    if (opts.onEnd) opts.onEnd();
  }

  return { type: "speechSynthesis", utterance: u };
}


/** Google Translate TTS using an already unlocked Audio element */
function speakGoogleWithAudio(audio, text, opts = {}) {
  try {
    pushLog("Google TTS Try", `Loading URL: "${text.substring(0, 30)}..."`);
    // client=gtx on translate.googleapis.com is lenient and bypasses Chrome localhost referrer blocks
    const url = `https://translate.googleapis.com/translate_tts?client=gtx&ie=UTF-8&tl=ar&q=${encodeURIComponent(text)}`;
    audio.src = url;

    audio.onended = () => {
      pushLog("Google TTS End", "Audio ended successfully");
      if (currentAudio === audio) {
        currentAudio = null;
      }
      if (opts.onEnd) opts.onEnd();
    };

    audio.onerror = (e) => {
      const errDetail = audio.error ? { code: audio.error.code, message: audio.error.message } : null;
      console.warn("Google Translate TTS failed, falling back to local SpeechSynthesis:", e);
      pushLog("Google TTS Error", "Failed to load/play Google cloud audio", errDetail);
      speakLocal(text, opts);
    };

    audio.play().then(() => {
      pushLog("Google TTS Start", "Audio started playing successfully");
    }).catch((err) => {
      console.warn("Audio play failed, falling back to local SpeechSynthesis:", err);
      pushLog("Google TTS Play Blocked", err.message);
      speakLocal(text, opts);
    });

    return { type: "audio", element: audio };
  } catch (err) {
    console.warn("Failed to play Google TTS, falling back to local SpeechSynthesis:", err);
    pushLog("Google TTS Exception", err.message);
    return speakLocal(text, opts);
  }
}


/** Standalone Google Translate TTS (for auto-play cases) */
function speakGoogle(text, opts = {}) {
  const audio = new Audio();
  currentAudio = audio;
  return speakGoogleWithAudio(audio, text, opts);
}

/**
 * Speak any text.
 * @param {string} text
 * @param {{ rate?: number, pitch?: number, onEnd?: () => void, onStart?: () => void }} [opts]
 */
export function speak(text, opts = {}) {
  if (!text) return null;

  stop();

  if (opts.onStart) opts.onStart();

  const audio = new Audio();
  currentAudio = audio;

  // 1. Try ElevenLabs API if key is provided (requires async fetch, so we unlock synchronously first)
  if (ELEVENLABS_API_KEY) {
    try {
      // Create and play a silent dummy audio track synchronously to register a user gesture.
      audio.src = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAAA";
      audio.play().catch(() => {});

      const voiceId = ELEVENLABS_VOICE_ID;
      pushLog("ElevenLabs Fetch", `Requesting speech for: "${text.substring(0, 30)}..."`);
      fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: "POST",
        headers: {
          "Accept": "audio/mpeg",
          "Content-Type": "application/json",
          "xi-api-key": ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text: text,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.6,
            similarity_boost: 0.75,
          },
        }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`ElevenLabs returned status ${response.status}`);
          }
          pushLog("ElevenLabs Blob", "Received binary response, processing blob");
          return response.blob();
        })
        .then((blob) => {
          const audioUrl = URL.createObjectURL(blob);
          audio.src = audioUrl;

          audio.onended = () => {
            pushLog("ElevenLabs End", "Audio ended successfully");
            if (currentAudio === audio) {
              currentAudio = null;
            }
            if (opts.onEnd) opts.onEnd();
          };

          audio.onerror = (e) => {
            const errDetail = audio.error ? { code: audio.error.code, message: audio.error.message } : null;
            console.warn("ElevenLabs audio playback failed, falling back to Google TTS:", e);
            pushLog("ElevenLabs Playback Error", "Failed to play ElevenLabs audio stream", errDetail);
            speakGoogleWithAudio(audio, text, opts);
          };

          audio.play().then(() => {
            pushLog("ElevenLabs Start", "ElevenLabs audio playing");
          }).catch((err) => {
            console.warn("ElevenLabs play call failed, falling back to Google TTS:", err);
            pushLog("ElevenLabs Play Blocked", err.message);
            speakGoogleWithAudio(audio, text, opts);
          });
        })
        .catch((err) => {
          console.warn("ElevenLabs request failed, falling back to Google TTS:", err);
          pushLog("ElevenLabs Request Error", err.message);
          speakGoogleWithAudio(audio, text, opts);
        });

      return { type: "elevenlabs_pending", element: audio };
    } catch (err) {
      console.warn("Failed to initiate ElevenLabs fetch, falling back to Google TTS:", err);
      pushLog("ElevenLabs Setup Exception", err.message);
    }
  }

  // 2. Otherwise default to Google Translate cloud TTS (synchronous, no dummy unlock needed)
  return speakGoogleWithAudio(audio, text, opts);
}

/** Stop any ongoing speech. */
export function stop() {
  // Cancel local SpeechSynthesis if active
  if (typeof window !== "undefined" && window.speechSynthesis) {
    try {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
    } catch (e) {
      console.error("Failed to cancel speechSynthesis:", e);
    }
  }

  // Cancel Audio play if active
  if (currentAudio) {
    try {
      currentAudio.pause();
    } catch (e) {
      console.error("Failed to pause audio element:", e);
    }
    currentAudio = null;
  }
}

/** Is speech currently playing? */
export function isSpeaking() {
  const isLocalSpeaking = typeof window !== "undefined" && (window.speechSynthesis?.speaking ?? false);
  const isAudioSpeaking = !!currentAudio && !currentAudio.paused;
  return isLocalSpeaking || isAudioSpeaking;
}

/** Always true if browser has speechSynthesis or HTML5 Audio. */
export function isTTSAvailable() {
  return typeof window !== "undefined" && (!!window.speechSynthesis || typeof Audio !== "undefined");
}

/**
 * Speak words one by one with a pause between each.
 * Returns a cancel function.
 */
export function speakSequence(words, opts = {}) {
  let cancelled = false;
  let idx = 0;

  function next() {
    if (cancelled || idx >= words.length) return;
    speak(words[idx], {
      rate: opts.rate ?? 0.75,
      onEnd: () => {
        idx++;
        setTimeout(next, opts.pauseMs ?? 600);
      },
    });
  }
  next();
  return () => {
    cancelled = true;
    stop();
  };
}
