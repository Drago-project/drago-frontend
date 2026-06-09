// ── FastAPI Connection ──────────────────────────────────────────────────
// The HuggingFace space mohamed4111/dyslexia-v2 runs a custom FastAPI app,
// not a Gradio app. This utility communicates with it directly via standard HTTP fetch.

const BASE_URL = "https://mohamed4111-dyslexia-v2.hf.space";
let isAvailable = false;

/**
 * Connect/Ping the HuggingFace space to check if it's active.
 * If the space is sleeping, this initiates the wake-up process.
 *
 * @returns {Promise<boolean>} True if the service is online.
 */
export async function connectSTT() {
  try {
    console.log("[STT] Checking FastAPI space status at:", BASE_URL);
    const response = await fetch(`${BASE_URL}/get_levels`);
    
    if (response.ok) {
      console.log("[STT] Connected successfully to FastAPI space.");
      isAvailable = true;
      return true;
    }
    throw new Error(`Service returned status: ${response.status}`);
  } catch (err) {
    isAvailable = false;
    console.warn("[STT] Failed to connect to HuggingFace space:", err);
    throw new Error(
      "Could not connect to the speech-to-text service. " +
      "The HuggingFace space may be sleeping — please try again in a moment."
    );
  }
}

/**
 * Send an audio blob and the target expected text to the model's check_word API.
 * Returns the clean transcribed text recognized by the model.
 *
 * @param {Blob} audioBlob - A Blob containing the recorded microphone audio.
 * @param {string} targetWord - The expected Arabic text (used by Whisper as context/initial prompt).
 * @returns {Promise<string>} The transcribed/recognized text.
 */
export async function transcribeAudio(audioBlob, targetWord = "") {
  if (!audioBlob) {
    throw new Error("[STT] No audio blob provided for transcription.");
  }

  // Create multipart/form-data payload as expected by check_word endpoint in app.py:
  // file: UploadFile, target_word: str = Form(...)
  const formData = new FormData();
  formData.append("file", audioBlob, "recording.webm");
  formData.append("target_word", targetWord);

  try {
    console.log(`[STT] Transcribing audio with target context: "${targetWord}"...`);
    const response = await fetch(`${BASE_URL}/check_word`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("[STT] Transcription API response:", result);

    if (result.status === "success") {
      isAvailable = true; // successfully completed a request
      return result.recognized || "";
    } else if (result.status === "retry") {
      throw new Error(result.message || "لم أسمع شيئاً بوضوح، يرجى المحاولة مرة أخرى.");
    } else {
      throw new Error(result.message || "حدث خطأ أثناء معالجة الصوت.");
    }
  } catch (err) {
    console.error("[STT] Transcription request failed:", err);
    throw new Error(
      err.message || "Transcription failed. The service may still be waking up — please retry shortly."
    );
  }
}

/**
 * Fire-and-forget helper that pre-warms the connection to the HuggingFace space.
 * Call this early (e.g. on page load) so the cold-start delay is absorbed
 * before the user actually needs to transcribe anything.
 */
export function warmUpSTT() {
  connectSTT().catch(() => {
    // Swallow the error — this is purely a best-effort warm-up.
    console.warn("[STT] Warm-up connection attempt failed (will retry on use).");
  });
}

/**
 * Check whether the STT client is already connected and ready to use.
 *
 * @returns {boolean} `true` if the cached client is connected.
 */
export function isSTTAvailable() {
  return isAvailable;
}

