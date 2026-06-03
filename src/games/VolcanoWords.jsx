import React, { useState, useEffect, useMemo, useRef } from "react";
import styles from "../styles/VolcanoWords.module.css";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import reading from "../assets/emotions/drago(reading).svg";
import sitting from "../assets/poses/drago(sitting).svg";
import { WinModal, LoseModal } from "../components/WinLose.jsx";

const API_BASE = "https://mohamed4111-dyslexia-v2.hf.space";
const HF_API_KEY = import.meta?.env?.VITE_HF_API_KEY || "";

const INITIAL_LAVA_LEVEL = 40;
const INITIAL_HINTS = 5;

// Recording settings
const API_TIMEOUT_MS = 30000; // 30 second timeout for API calls

function VolcanoWords() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Levels
  const [levels, setLevels] = useState(null);
  const [levelId, setLevelId] = useState("1");
  const [words, setWords] = useState([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  // Game
  const [lavaLevel, setLavaLevel] = useState(INITIAL_LAVA_LEVEL);
  const [hints, setHints] = useState(INITIAL_HINTS);
  const [score, setScore] = useState(0);
  const [gameStatus, setGameStatus] = useState("playing");

  // Speech / feedback
  const [isRecording, setIsRecording] = useState(false);
  const [phase, setPhase] = useState("idle");
  const [transcript, setTranscript] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [showFeedbackIndicator, setShowFeedbackIndicator] = useState(false);

  // Endpoint outputs
  const [diffHtml, setDiffHtml] = useState("");
  const [similarity, setSimilarity] = useState(null);
  const [analysis, setAnalysis] = useState(null);
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
        setLastError(t("volcanoWords.errors.loadLevelsFailed"));
        alert(t("volcanoWords.errors.loadLevelsFailed"));
      }
    })();
  }, [t]);

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

  // Helpers
  function shuffle(arr) {
    return [...arr].sort(() => 0.5 - Math.random());
  }

  function resetPerWordUI() {
    setTranscript("");
    setDiffHtml("");
    setAnalysis(null);
    setSimilarity(null);
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
          {t("volcanoWords.feedback.noMistakes")}
        </div>
      );
    }

    return (
      <div style={{ marginTop: 12, textAlign: "left", fontSize: 14, lineHeight: 1.6 }}>
        <div style={{ fontWeight: 800, marginBottom: 6 }}>{t("volcanoWords.mistakes.title")}</div>

        {analysisJson.mistakes.map((m, idx) => {
          if (m.type === "missing") {
            return (
              <div key={idx} style={{ color: "#e53935" }}>
                • {t("volcanoWords.mistakes.missing")}: <b>{m.expected}</b>
              </div>
            );
          }

          if (m.type === "extra") {
            return (
              <div key={idx} style={{ color: "#fb8c00" }}>
                • {t("volcanoWords.mistakes.extra")}: <b>{m.spoken}</b>
              </div>
            );
          }

          if (m.type === "substitute") {
            const edits = m?.char_detail?.char_edits || [];
            return (
              <div key={idx} style={{ color: "#e53935" }}>
                • {t("volcanoWords.mistakes.substitute")} <b>{m.spoken}</b> {t("volcanoWords.mistakes.insteadOf")}{" "}
                <b>{m.expected}</b>
                {edits.length > 0 && (
                  <div style={{ marginLeft: 10, marginTop: 4, color: "#444" }}>
                    {t("volcanoWords.mistakes.letters")}
                    {edits.slice(0, 8).map((e, i) => (
                      <span key={i} style={{ marginLeft: 8 }}>
                        {e.type === "substitute_char" && (
                          <>
                            {" "}
                            {e.expected_char} → {e.spoken_char}{" "}
                          </>
                        )}
                        {e.type === "missing_char" && (
                          <> {t("volcanoWords.mistakes.missingChar")} "{e.expected_char}" </>
                        )}
                        {e.type === "extra_char" && (
                          <> {t("volcanoWords.mistakes.extraChar")} "{e.spoken_char}" </>
                        )}
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

  // Game logic
  const handleCorrectAnswer = () => {
    setFeedback("correct");
    setShowFeedbackIndicator(true);
    setScore((prev) => prev + 10);
    setLavaLevel((prev) => Math.max(0, prev - 10));

    setTimeout(() => {
      setShowFeedbackIndicator(false);
    }, 1200);
  };

  const handleNextWord = () => {
    if (currentWordIndex < words.length - 1) {
      setCurrentWordIndex((prev) => prev + 1);
      resetPerWordUI();
    } else {
      setGameStatus("won");
    }
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

  // TTS Hint
  const handleUseHint = async () => {
    if (hints <= 0 || isRecording || isGameOver || !activeWord) return;
    setHints((prev) => prev - 1);

    try {
      const audio = new Audio(`${API_BASE}/tts?word=${encodeURIComponent(activeWord)}&t=${Date.now()}`);
      await audio.play();
    } catch (e) {
      console.error(e);
      setLastError(t("volcanoWords.errors.ttsFailed"));
    }
  };

  // Recording + API with timeout
  const handleStartRecording = async () => {
    if (isGameOver) return;

    // Manual STOP
    if (isRecording && recorderRef.current?.state === "recording") {
      try {
        clearTimeout(stopTimerRef.current);
        recorderRef.current.stop();
        setPhase("uploading"); // optional: show uploading while stopping
      } catch (e) {
        console.error("Error stopping recorder:", e);
      }
      return;
    }

    // Manual START
    resetPerWordUI();
    setIsRecording(true);
    setPhase("recording");

    try {
      await startRecording(activeWord);
    } catch (e) {
      console.error(e);
      setIsRecording(false);
      setPhase("idle");
      setLastError(t("volcanoWords.errors.recordingFailed"));
    }
  };


  async function startRecording(wordAtStart) {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
    });

    const recorder = new MediaRecorder(stream); // let browser choose best
    recorderRef.current = recorder;
    chunksRef.current = [];

    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onerror = (e) => {
      console.error("Recorder error:", e);
      stream.getTracks().forEach((t) => t.stop());
      setIsRecording(false);
      setPhase("idle");
      setLastError(t("volcanoWords.errors.recordingFailed"));
    };

    recorder.onstop = async () => {
      try {
        clearTimeout(stopTimerRef.current);

        stream.getTracks().forEach((tr) => tr.stop());

        const blob = new Blob(chunksRef.current, { type: "audio/webm" });

        setIsRecording(false);

        if (blob.size < 5000) {
          setPhase("idle");
          setLastError(t("volcanoWords.errors.audioNotClear"));
          handleWrongAnswer();
          return;
        }

        setPhase("uploading");

        const check = await callCheckWordWithTimeout(blob, wordAtStart);

        if (!check || typeof check.status !== "string") {
          setPhase("idle");
          setLastError(t("volcanoWords.errors.checkWordError"));
          return;
        }

        if (check.status === "retry") {
          setPhase("idle");
          setLastError(check.message || t("volcanoWords.errors.audioNotClear"));
          handleWrongAnswer();
          return;
        }

        if (check.status === "error") {
          setPhase("idle");
          setLastError(check.message || t("volcanoWords.errors.checkWordError"));
          return;
        }

        if (check.status !== "success") {
          setPhase("idle");
          setLastError(check.message || "Unexpected server response");
          return;
        }

        const recognizedText = check.recognized ?? check.spoken_text ?? "";
        setTranscript(recognizedText);

        setDiffHtml(check.diff_html || "");
        setSimilarity(check.similarity ?? null);

        setAnalysis(check.analysis || null);
        setCounts(check.counts || null);

        setPhase("idle");

        if (check.passed) handleCorrectAnswer();
        else handleWrongAnswer();
      } catch (e) {
        console.error(e);
        setIsRecording(false);
        setPhase("idle");
        setLastError(t("volcanoWords.errors.connectionError"));
      }
    };

    recorder.start(); // manual stop

    // ✅ Fix "speak immediately": request an early chunk
    setTimeout(() => {
      try {
        recorder.requestData();
      } catch { }
    }, 150);

    // OPTIONAL safety max: auto-stop after 15s if user forgets
    stopTimerRef.current = setTimeout(() => {
      if (recorderRef.current?.state === "recording") {
        try {
          recorderRef.current.stop();
        } catch { }
      }
    }, 15000);
  }


  // Helper: fetch with timeout
  async function fetchWithTimeout(url, options, timeout = API_TIMEOUT_MS) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(id);
      return response;
    } catch (error) {
      clearTimeout(id);
      if (error.name === "AbortError") {
        throw new Error("Request timeout - الطلب استغرق وقتاً طويلاً");
      }
      throw error;
    }
  }

  async function callCheckWordWithTimeout(audioBlob, targetWord) {
    const form = new FormData();
    form.append("file", audioBlob, "speech.webm");
    form.append("target_word", targetWord);

    const headers = HF_API_KEY ? { "X-API-Key": HF_API_KEY } : undefined;

    try {
      const res = await fetchWithTimeout(`${API_BASE}/check_word`, {
        method: "POST",
        headers,
        body: form,
      });

      if (!res.ok) return { status: "error", message: await res.text() };
      return await res.json();
    } catch (error) {
      console.error("Check word error:", error);
      return {
        status: "error",
        message: error.message || t("volcanoWords.errors.connectionError"),
      };
    }
  }

  // Render
  return (
    <div className={styles.gameContainer}>
      <nav className={styles.headerNav}>
        <button className={styles.exitBtn} onClick={() => navigate("/home")}>
          {t("volcanoWords.exit")}
        </button>

        <div className={styles.heartsContainer}>
          {[...Array(INITIAL_HINTS)].map((_, i) => (
            <span key={i} className={styles.heart} style={{ opacity: i < hints ? 1 : 0.3 }}>
              💛
            </span>
          ))}
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontWeight: 700 }}>{t("volcanoWords.level")}:</span>
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

        <div className={styles.scoreBoard}>
          {t("volcanoWords.score")}: {score}
        </div>
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
          handleNextWord={handleNextWord}
          isGameOver={isGameOver}
          diffHtml={diffHtml}
          counts={counts}
          lastError={lastError}
          similarity={similarity}
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
          {t("volcanoWords.winMessage")}
        </WinModal>
      ) : gameStatus === "lost" ? (
        <LoseModal score={score} restartGame={restartGame}>
          {t("volcanoWords.loseMessage")}
        </LoseModal>
      ) : null}
    </div>
  );
}

// Sub-Components

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
  handleNextWord,
  isGameOver,
  diffHtml,
  counts,
  lastError,
  analysis,
  renderMistakes,
  similarity,
}) {
  const isArabic = /[\u0600-\u06FF]/.test(word || "");
  const { t } = useTranslation();

  return (
    <div className={styles.wordPanel}>
      <div className={styles.wordCard}>
        <div className={styles.wordDisplay} style={{ direction: isArabic ? "rtl" : "ltr" }}>
          {word || "..."}
        </div>

        {phase !== "idle" && (
          <div style={{ marginTop: 10, fontSize: 14, fontWeight: 800 }}>
            {phase === "recording" && t("volcanoWords.phases.recording")}
            {phase === "uploading" && t("volcanoWords.phases.uploading")}
            {phase === "processing" && t("volcanoWords.phases.processing")}
          </div>
        )}

        {feedback && (
          <div
            className={`${styles.feedbackMessage} ${feedback === "correct" ? styles.feedbackCorrect : styles.feedbackWrong
              }`}
          >
            {feedback === "correct" ? t("volcanoWords.feedback.correct") : t("volcanoWords.feedback.wrong")}
          </div>
        )}

        {isRecording && <div className={styles.feedbackMessage}>{t("volcanoWords.phases.listening")}</div>}

        {transcript && (
          <div className={styles.transcriptText} style={{ direction: isArabic ? "rtl" : "ltr" }}>
            {t("volcanoWords.feedback.youSaid")}: "<strong>{transcript}</strong>"
          </div>
        )}

        {similarity !== null && (
          <div style={{ marginTop: 6, fontSize: 12, opacity: 0.75 }}>
            Similarity: {Math.round(similarity)}%
          </div>
        )}

        {diffHtml && (
          <div
            style={{ marginTop: 10, fontSize: 16, direction: "rtl", lineHeight: 1.7 }}
            dangerouslySetInnerHTML={{ __html: diffHtml }}
          />
        )}

        {analysis && renderMistakes(analysis)}

        {counts && (
          <div style={{ marginTop: 10, fontSize: 13, opacity: 0.9 }}>
            الأخطاء: ناقص {counts.missing_words}, زائد {counts.extra_words}, مستبدل {counts.substitute_words}
          </div>
        )}

        {lastError && (
          <div style={{ marginTop: 10, fontSize: 12, color: "#f44336", fontWeight: 600 }}>
            {lastError}
          </div>
        )}

        <div className={styles.wordCounter}>
          {t("volcanoWords.word")} {Math.min(wordIndex + 1, numWords || 1)} {t("volcanoWords.of")} {numWords || 1}
        </div>
      </div>

      <div className={styles.actionButtons}>
        {feedback === "correct" ? (
          <ActionBtn icon="➡️" primary onClick={handleNextWord} />
        ) : (
          <>
            <ActionBtn
              icon={isRecording ? "🛑" : "🎤"}
              primary
              disabled={isGameOver || (!isRecording && phase !== "idle")}
              onClick={handleStartRecording} />
            <ActionBtn icon="💡" disabled={hints <= 0 || isRecording || isGameOver} onClick={handleUseHint} />
            <ActionBtn icon="➡️" disabled={isRecording || isGameOver} onClick={handleSkipWord} />
          </>
        )}
      </div>
    </div>
  );
}

function ActionBtn({ icon, onClick, disabled = false, primary = false }) {
  return (
    <button className={`${styles.actionBtn} ${primary ? styles.primary : ""}`} disabled={disabled} onClick={onClick}>
      {icon}
    </button>
  );
}

export default VolcanoWords;
