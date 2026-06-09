import { useState, useRef, useCallback } from "react";

/**
 * useAudioRecorder
 *
 * A React hook that provides a simple interface around the browser's
 * MediaRecorder API for capturing microphone audio.
 *
 * @returns {{
 *   isRecording: boolean,
 *   audioBlob: Blob | null,
 *   error: string | null,
 *   start: () => Promise<void>,
 *   stop: () => Promise<Blob>,
 *   reset: () => void
 * }}
 */
export function useAudioRecorder() {
  // ── State ───────────────────────────────────────────────────────────
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [error, setError] = useState(null);

  // ── Refs (avoid stale closures in callbacks) ────────────────────────
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);

  // ── Helpers ─────────────────────────────────────────────────────────

  /**
   * Stop all tracks on the active media stream so the browser releases
   * the microphone indicator.
   */
  const stopStreamTracks = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  /**
   * Determine the best supported MIME type for recording.
   * Prefer webm (smaller, widely supported in modern browsers).
   */
  const getPreferredMimeType = useCallback(() => {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported) {
      if (MediaRecorder.isTypeSupported("audio/webm")) return "audio/webm";
      if (MediaRecorder.isTypeSupported("audio/ogg")) return "audio/ogg";
      if (MediaRecorder.isTypeSupported("audio/mp4")) return "audio/mp4";
    }
    // Let the browser decide
    return undefined;
  }, []);

  // ── start ───────────────────────────────────────────────────────────
  const start = useCallback(async () => {
    // Clear any previous error / blob
    setError(null);
    setAudioBlob(null);
    chunksRef.current = [];

    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Create the MediaRecorder with the best available MIME type
      const mimeType = getPreferredMimeType();
      const options = mimeType ? { mimeType } : undefined;
      const recorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = recorder;

      // Collect audio data chunks as they arrive
      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      // Handle unexpected errors from the recorder itself
      recorder.onerror = (event) => {
        console.error("[useAudioRecorder] MediaRecorder error:", event.error);
        setError("An error occurred while recording audio.");
        setIsRecording(false);
        stopStreamTracks();
      };

      recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("[useAudioRecorder] Failed to start recording:", err);

      // Provide user-friendly error messages for common failure cases
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setError("Microphone permission was denied. Please allow access and try again.");
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        setError("No microphone was found. Please connect a microphone and try again.");
      } else {
        setError("Could not start audio recording: " + err.message);
      }
    }
  }, [getPreferredMimeType, stopStreamTracks]);

  // ── stop ────────────────────────────────────────────────────────────
  const stop = useCallback(() => {
    return new Promise((resolve, reject) => {
      const recorder = mediaRecorderRef.current;

      if (!recorder || recorder.state === "inactive") {
        const msg = "No active recording to stop.";
        console.warn("[useAudioRecorder]", msg);
        setError(msg);
        reject(new Error(msg));
        return;
      }

      // When the recorder fires `onstop`, assemble the final Blob
      recorder.onstop = () => {
        const mimeType = recorder.mimeType || "audio/webm";
        const blob = new Blob(chunksRef.current, { type: mimeType });

        setAudioBlob(blob);
        setIsRecording(false);
        stopStreamTracks();

        // Clean up refs
        mediaRecorderRef.current = null;
        chunksRef.current = [];

        resolve(blob);
      };

      recorder.stop();
    });
  }, [stopStreamTracks]);

  // ── reset ───────────────────────────────────────────────────────────
  const reset = useCallback(() => {
    setAudioBlob(null);
    setError(null);
  }, []);

  // ── Public API ──────────────────────────────────────────────────────
  return {
    isRecording,
    audioBlob,
    error,
    start,
    stop,
    reset,
  };
}
