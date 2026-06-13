import React from "react";

/**
 * TTSButton — Premium animated TTS control
 *
 * Props:
 *   text        {string}   Text to speak when clicked
 *   isSpeaking  {boolean}  Controlled speaking state
 *   onSpeak     {fn}       Called when play is pressed
 *   onStop      {fn}       Called when stop is pressed
 *   isSupported {boolean}  Hide/disable if false
 *   label       {string}   Optional aria-label override
 *   labelText   {string}   Optional button display text when idle
 *   size        {'sm'|'md'|'lg'}  Visual size
 *   variant     {'pill'|'icon'}  'pill' = text + icon, 'icon' = icon only
 */
export function TTSButton({
  text,
  isSpeaking,
  onSpeak,
  onStop,
  isSupported = true,
  label = "استمع للسؤال",
  labelText = "اسمع",
  size = "md",
  variant = "pill",
}) {
  if (!isSupported) return null;

  function handleClick() {
    if (isSpeaking) {
      onStop();
    } else {
      onSpeak(text);
    }
  }

  const sizeClass = `ttsBtn--${size}`;
  const variantClass = `ttsBtn--${variant}`;
  const stateClass = isSpeaking ? "ttsBtn--speaking" : "";

  return (
    <button
      type="button"
      className={`ttsBtn ${sizeClass} ${variantClass} ${stateClass}`}
      onClick={handleClick}
      aria-label={isSpeaking ? "إيقاف الصوت" : label}
      aria-pressed={isSpeaking}
      title={isSpeaking ? "إيقاف الصوت" : label}
    >
      {/* Waveform bars — animated only while speaking */}
      <span className="ttsWave" aria-hidden="true">
        <span className="ttsBar" />
        <span className="ttsBar" />
        <span className="ttsBar" />
        <span className="ttsBar" />
        <span className="ttsBar" />
      </span>

      {/* Speaker / Stop icon */}
      <span className="ttsIcon" aria-hidden="true">
        {isSpeaking ? "⏹" : "🔊"}
      </span>

      {/* Label text — shown in pill variant */}
      {variant === "pill" && (
        <span className="ttsLabel">
          {isSpeaking ? "إيقاف" : labelText}
        </span>
      )}

      {/* Pulse ring — decorative glow when idle */}
      {!isSpeaking && <span className="ttsPulse" aria-hidden="true" />}
    </button>
  );
}

