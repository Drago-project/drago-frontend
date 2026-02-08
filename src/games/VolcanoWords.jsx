import React, { useState, useEffect, useMemo, useRef } from "react";
import styles from "../styles/VolcanoWords.module.css";
import { useNavigate } from "react-router-dom";

import reading from "../assets/emotions/drago(reading).svg";
import sitting from "../assets/poses/drago(sitting).svg";
import { WinModal, LoseModal } from "../components/WinLose.jsx";

const API_BASE = "https://mohamed4111-dyslexia.hf.space";

// Vite env: .env next to package.json
// VITE_HF_API_KEY=xxxx
const HF_API_KEY = import.meta?.env?.VITE_HF_API_KEY || "";

const INITIAL_LAVA_LEVEL = 40;
const INITIAL_HINTS = 5;

// Recording settings
const RECORDING_MS = 6000;
const TIMESLICE_MS = 250;

function VolcanoWords() {
  const navigate = useNavigate();

  // Levels
  const [levels, setLevels] = useState(null);
  const [levelId, setLevelId] = useState("1");
  const [words, setWords] = useState([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  // Game
  const [lavaLevel, setLavaLevel] = useState(INITIAL_LAVA_LEVEL);
  const [hints, setHints] = useState(INITIAL_HINTS);
  const [score, setScore] = useState(0);
  const [gameStatus, setGameStatus] = useState("playing"); // playing|won|lost

  // Speech / feedback
  const [isRecording, setIsRecording] = useState(false);
  const [phase, setPhase] = useState("idle"); // idle|recording|uploading|processing
  const [transcript, setTranscript] = useState("");
  const [feedback, setFeedback] = useState(null); // correct|wrong|null
  const [showFeedbackIndicator, setShowFeedbackIndicator] = useState(false);

  // Endpoint outputs
  const [diffHtml, setDiffHtml] = useState("");
  const [analysis, setAnalysis] = useState(null); // full /analyze output
  const [counts, setCounts] = useState(null);
  const [lastError, setLastError] = useState("");

  // Dragon pose
  const [dragoPose, setDragoPose] = useState(reading);

  const isGameOver = gameStatus !== "playing";
  const activeWord = words[currentWordIndex] || "";
  const numWords = words.length;

  // Recorder refs
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const stopTimerRef = useRef(null);

  // Load levels
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/get_levels`);
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        setLevels(data);

        const first = data["1"] ? "1" : Object.keys(data)[0];
        setLevelId(first);

        const list = Array.isArray(data[first]?.content) ? data[first].content : [];
        setWords(shuffle(list));
        setCurrentWordIndex(0);
      } catch (e) {
        console.error(e);
        setLastError("Failed to load levels from /get_levels");
        alert("Failed to load levels from Hugging Face Space.");
      }
    })();
  }, []);

  // Pose based on recording
  useEffect(() => {
    setDragoPose(isRecording ? sitting : reading);
  }, [isRecording]);

  // Lava bubbles
  const lavaBubbles = useMemo(
    () =>
      [...Array(8)].map((_, i) => ({
        key: i,
        width: `${15 + Math.random() * 20}px`,
        height: `${15 + Math.random() * 20}px`,
        left: `${10 + i * 12}%`,
        bottom: `${Math.random() * 30}px`,
        animationDelay: `${i * 0.4}s`,
        animationDuration: `${2 + Math.random() * 2}s`,
      })),
    []
  );

  // -----------------------------
  // Helpers
  // -----------------------------
  function shuffle(arr) {
    return [...arr].sort(() => 0.5 - Math.random());
  }

  function resetPerWordUI() {
    setTranscript("");
    setDiffHtml("");
    setAnalysis(null);
    setCounts(null);
    setFeedback(null);
    setShowFeedbackIndicator(false);
    setLastError("");
    setPhase("idle");
  }

  function renderMistakes(analysisJson) {
    if (!analysisJson?.mistakes?.length) {
      return (
        <div style={{ marginTop: 12, fontSize: 14, color: "#2e7d32", fontWeight: 700 }}>
          ✅ No mistakes
        </div>
      );
    }

    return (
      <div style={{ marginTop: 12, textAlign: "left", fontSize: 14, lineHeight: 1.6 }}>
        <div style={{ fontWeight: 800, marginBottom: 6 }}>Mistakes:</div>

        {analysisJson.mistakes.map((m, idx) => {
          if (m.type === "missing") {
            return (
              <div key={idx} style={{ color: "#e53935" }}>
                • Missing word: <b>{m.expected}</b>
              </div>
            );
          }

          if (m.type === "extra") {
            return (
              <div key={idx} style={{ color: "#fb8c00" }}>
                • Extra word: <b>{m.spoken}</b>
              </div>
            );
          }

          if (m.type === "substitute") {
            const edits = m?.char_detail?.char_edits || [];
            return (
              <div key={idx} style={{ color: "#e53935" }}>
                • Said <b>{m.spoken}</b> instead of <b>{m.expected}</b>
                {edits.length > 0 && (
                  <div style={{ marginLeft: 10, marginTop: 4, color: "#444" }}>
                    Letters:
                    {edits.slice(0, 8).map((e, i) => (
                      <span key={i} style={{ marginLeft: 8 }}>
                        {e.type === "substitute_char" && (
                          <>
                            {" "}
                            {e.expected_char} → {e.spoken_char}{" "}
                          </>
                        )}
                        {e.type === "missing_char" && <> missing “{e.expected_char}” </>}
                        {e.type === "extra_char" && <> extra “{e.spoken_char}” </>}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return null;
        })}
      </div>
    );
  }

  // -----------------------------
  // Game logic
  // -----------------------------
  const handleCorrectAnswer = () => {
    setFeedback("correct");
    setShowFeedbackIndicator(true);
    setScore((prev) => prev + 10);
    setLavaLevel((prev) => Math.max(0, prev - 10));

    setTimeout(() => {
      if (currentWordIndex < words.length - 1) {
        setCurrentWordIndex((prev) => prev + 1);
        resetPerWordUI();
      } else {
        setGameStatus("won");
      }
    }, 1200);
  };

  const handleWrongAnswer = () => {
    setFeedback("wrong");
    setShowFeedbackIndicator(true);

    setLavaLevel((prev) => {
      const newLevel = Math.min(100, prev + 15);
      if (newLevel >= 100) setGameStatus("lost");
      return newLevel;
    });

    setTimeout(() => {
      setShowFeedbackIndicator(false);
      setFeedback(null);
    }, 1200);
  };

  const handleSkipWord = () => {
    if (isGameOver) return;

    if (currentWordIndex < words.length - 1) {
      setCurrentWordIndex((prev) => prev + 1);
      resetPerWordUI();
    } else {
      setGameStatus(score > (words.length / 2) * 10 ? "won" : "lost");
    }
  };

  const restartGame = () => {
    setCurrentWordIndex(0);
    setLavaLevel(INITIAL_LAVA_LEVEL);
    setHints(INITIAL_HINTS);
    setScore(0);
    setIsRecording(false);
    resetPerWordUI();
    setGameStatus("playing");
    setDragoPose(reading);

    if (levels?.[levelId]?.content) {
      setWords(shuffle(levels[levelId].content));
    }
  };

  const handleChangeLevel = (newLevelId) => {
    if (!levels?.[newLevelId]) return;
    setLevelId(newLevelId);
    setWords(shuffle(levels[newLevelId].content || []));
    setCurrentWordIndex(0);

    setLavaLevel(INITIAL_LAVA_LEVEL);
    setHints(INITIAL_HINTS);
    setScore(0);
    setGameStatus("playing");
    resetPerWordUI();
  };

  // -----------------------------
  // Endpoint: /tts (Hint)
  // -----------------------------
  const handleUseHint = async () => {
    if (hints <= 0 || isRecording || isGameOver || !activeWord) return;
    setHints((prev) => prev - 1);

    try {
      const audio = new Audio(`${API_BASE}/tts?word=${encodeURIComponent(activeWord)}&t=${Date.now()}`);
      await audio.play();
    } catch (e) {
      console.error(e);
      setLastError("TTS failed");
    }
  };

  // -----------------------------
  // Recording + endpoints:
  // /check_word (pass/retry + diff_html)
  // /analyze    (accurate mistakes + counts)
  // -----------------------------
  const handleStartRecording = async () => {
    if (isGameOver) return;

    // Stop early if recording
    if (isRecording && recorderRef.current?.state === "recording") {
      try {
        clearTimeout(stopTimerRef.current);
        recorderRef.current.stop();
      } catch { }
      return;
    }

    resetPerWordUI();
    setIsRecording(true);
    setPhase("recording");

    try {
      const blob = await recordAudioBlob();

      setIsRecording(false);
      setPhase("uploading");

      // Primary: /check_word
      const check = await callCheckWord(blob, activeWord);

      if (check.status === "retry") {
        setPhase("idle");
        setLastError("Audio not clear. Speak louder & closer to the mic.");
        handleWrongAnswer();
        return;
      }
      if (check.status === "error") {
        setPhase("idle");
        setLastError(check.message || "check_word error");
        return;
      }

      setTranscript(check.spoken_text || "");
      setDiffHtml(check.diff_html || "");

      // Optional but important: /analyze for correct mistakes display
      setPhase("processing");
      try {
        const ana = await callAnalyze(blob, activeWord);
        setAnalysis(ana);
        setCounts(ana?.counts || null);
        // If your /check_word spoken_text differs, prefer /analyze spoken_text
        if (ana?.spoken_text) setTranscript(ana.spoken_text);
      } catch (e) {
        // If analyze fails (401/no key), game still works
      } finally {
        setPhase("idle");
      }

      if (check.passed) handleCorrectAnswer();
      else handleWrongAnswer();
    } catch (e) {
      console.error(e);
      setIsRecording(false);
      setPhase("idle");
      setLastError("Recording failed. Check mic permission.");
      alert("Recording failed. Check microphone permission.");
    }
  };

  async function recordAudioBlob() {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
    });

    const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
      ? "audio/webm;codecs=opus"
      : "audio/webm";

    const recorder = new MediaRecorder(stream, { mimeType });
    recorderRef.current = recorder;
    chunksRef.current = [];

    return await new Promise((resolve, reject) => {
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onerror = (e) => reject(e);

      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: mimeType });

        // prevent “silent/empty” audio
        if (blob.size < 5000) {
          reject(new Error("Empty/too small audio blob"));
          return;
        }
        resolve(blob);
      };

      // timeslice => reliable chunking
      recorder.start(TIMESLICE_MS);

      stopTimerRef.current = setTimeout(() => {
        try {
          recorder.stop();
        } catch { }
      }, RECORDING_MS);
    });
  }

  async function callCheckWord(audioBlob, targetWord) {
    const form = new FormData();
    form.append("file", audioBlob, "speech.webm");
    form.append("target_word", targetWord);

    const res = await fetch(`${API_BASE}/check_word`, {
      method: "POST",
      body: form,
    });

    if (!res.ok) return { status: "error", message: await res.text() };
    return await res.json();
  }

  async function callAnalyze(audioBlob, expectedText) {
    const form = new FormData();
    form.append("audio", audioBlob, "speech.webm");
    form.append("expected_text", expectedText);
    form.append("beam_size", "5");

    const headers = HF_API_KEY ? { "X-API-Key": HF_API_KEY } : undefined;

    const res = await fetch(`${API_BASE}/analyze`, {
      method: "POST",
      headers,
      body: form,
    });

    if (!res.ok) throw new Error(await res.text());
    return await res.json();
  }

  // -----------------------------
  // Render
  // -----------------------------
  return (
    <div className={styles.gameContainer}>
      <nav className={styles.headerNav}>
        <button className={styles.exitBtn} onClick={() => navigate("/home")}>
          Exit
        </button>

        <div className={styles.heartsContainer}>
          {[...Array(INITIAL_HINTS)].map((_, i) => (
            <span key={i} className={styles.heart} style={{ opacity: i < hints ? 1 : 0.3 }}>
              💛
            </span>
          ))}
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontWeight: 700 }}>Level:</span>
          <select
            value={levelId}
            onChange={(e) => handleChangeLevel(e.target.value)}
            disabled={!levels || isRecording}
            style={{ padding: "6px 10px", borderRadius: 10 }}
          >
            {levels
              ? Object.keys(levels).map((id) => (
                <option key={id} value={id}>
                  {levels[id]?.name || `Level ${id}`}
                </option>
              ))
              : null}
          </select>
        </div>

        <div className={styles.scoreBoard}>Score: {score}</div>
      </nav>

      <div className={styles.gameContent}>
        <WordPanal
          word={activeWord}
          isRecording={isRecording}
          phase={phase}
          transcript={transcript}
          feedback={feedback}
          hints={hints}
          wordIndex={currentWordIndex}
          numWords={numWords}
          handleStartRecording={handleStartRecording}
          handleUseHint={handleUseHint}
          handleSkipWord={handleSkipWord}
          isGameOver={isGameOver}
          diffHtml={diffHtml}
          counts={counts}
          lastError={lastError}
          analysis={analysis}
          renderMistakes={renderMistakes}
        />

        <div className={styles.dragonContainer}>
          <img src={dragoPose} alt="Drago" className={styles.dragonImage} />
        </div>

        <VolcanoPanel
          lavaLevel={lavaLevel}
          lavaBubbles={lavaBubbles}
          feedback={feedback}
          showFeedbackIndicator={showFeedbackIndicator}
        />
      </div>

      {gameStatus === "won" ? (
        <WinModal score={score} restartGame={restartGame}>
          Drago escaped the volcano!
        </WinModal>
      ) : gameStatus === "lost" ? (
        <LoseModal score={score} restartGame={restartGame}>
          Drago got overwhelmed by the lava!
        </LoseModal>
      ) : null}
    </div>
  );
}

// --- Sub-Components ---

function VolcanoPanel({ lavaLevel, lavaBubbles, feedback, showFeedbackIndicator }) {
  return (
    <div className={styles.volcanoPanel}>
      <div style={{ position: "relative" }}>
        <div className={styles.volcanoContainer}>
          <div className={styles.volcanoTop}></div>

          <div className={styles.lavaContainer}>
            <div className={styles.lavaLevel} style={{ height: `${lavaLevel}%` }}>
              <div className={styles.lavaSurface}></div>
              {lavaBubbles.map((bubble) => (
                <div key={bubble.key} className={styles.lavaBubble} style={bubble} />
              ))}
            </div>
          </div>

          {showFeedbackIndicator && (
            <div className={`${styles.feedbackIndicator} ${styles[feedback]}`}>
              {feedback === "correct" ? "✓ +10" : "✗ +15% Lava"}
            </div>
          )}
        </div>

        <div className={styles.percentageMarkers}>
          <div className={`${styles.marker} ${lavaLevel >= 100 ? styles.critical : ""}`}>100%</div>
          <div className={styles.marker}>75%</div>
          <div className={styles.marker}>50%</div>
          <div className={styles.marker}>25%</div>
          <div className={styles.marker}>0%</div>
        </div>
      </div>
    </div>
  );
}

function WordPanal({
  word,
  isRecording,
  phase,
  transcript,
  feedback,
  hints,
  wordIndex,
  numWords,
  handleStartRecording,
  handleUseHint,
  handleSkipWord,
  isGameOver,
  diffHtml,
  counts,
  lastError,
  analysis,
  renderMistakes,
}) {
  const isArabic = /[\u0600-\u06FF]/.test(word || "");

  return (
    <div className={styles.wordPanel}>
      <div className={styles.wordCard}>
        <div className={styles.wordDisplay} style={{ direction: isArabic ? "rtl" : "ltr" }}>
          {word || "..."}
        </div>

        {/* Phase indicator */}
        {phase !== "idle" && (
          <div style={{ marginTop: 10, fontSize: 14, fontWeight: 800 }}>
            {phase === "recording" && "🎙️ Listening... (tap again to stop)"}
            {phase === "uploading" && "⬆️ Uploading audio..."}
            {phase === "processing" && "⚙️ Processing..."}
          </div>
        )}

        {feedback && (
          <div
            className={`${styles.feedbackMessage} ${feedback === "correct" ? styles.feedbackCorrect : styles.feedbackWrong
              }`}
          >
            {feedback === "correct" ? "✓ Correct! Well done!" : "✗ Try again!"}
          </div>
        )}

        {isRecording && <div className={styles.feedbackMessage}>...Listening...</div>}

        {transcript && (
          <div className={styles.transcriptText} style={{ direction: isArabic ? "rtl" : "ltr" }}>
            You said: "<strong>{transcript}</strong>"
          </div>
        )}

        {/* quick diff from /check_word */}
        {diffHtml && (
          <div
            style={{ marginTop: 10, fontSize: 16, direction: "rtl", lineHeight: 1.7 }}
            dangerouslySetInnerHTML={{ __html: diffHtml }}
          />
        )}

        {/* accurate mistakes from /analyze */}
        {analysis && renderMistakes(analysis)}

        {/* counts from /analyze */}
        {counts && (
          <div style={{ marginTop: 10, fontSize: 13, opacity: 0.9 }}>
            Mistakes: missing {counts.missing_words}, extra {counts.extra_words}, substitute{" "}
            {counts.substitute_words}
          </div>
        )}

        {lastError && (
          <div style={{ marginTop: 10, fontSize: 12, color: "#f44336" }}>{lastError}</div>
        )}

        <div className={styles.wordCounter}>
          Word {Math.min(wordIndex + 1, numWords || 1)} of {numWords || 1}
        </div>
      </div>

      <div className={styles.actionButtons}>
        <ActionBtn
          icon={isRecording ? "🛑" : "🎤"}
          primary
          disabled={isGameOver}
          onClick={handleStartRecording}
        />
        <ActionBtn icon="💡" disabled={hints <= 0 || isRecording || isGameOver} onClick={handleUseHint} />
        <ActionBtn icon="➡️" disabled={isRecording || isGameOver} onClick={handleSkipWord} />
      </div>
    </div>
  );
}

function ActionBtn({ icon, onClick, disabled = false, primary = false }) {
  return (
    <button
      className={`${styles.actionBtn} ${primary ? styles.primary : ""}`}
      disabled={disabled}
      onClick={onClick}
    >
      {icon}
    </button>
  );
}

export default VolcanoWords;
