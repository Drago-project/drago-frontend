// src/games/ReadingQuest.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/ReadingQuest.module.css";
import { WinModal, LoseModal } from "../components/WinLose";
import { BoatSVG, TornadoSVG } from "../components/GameIcons";
import { shalalAPI } from "../server/endpoints";

function ReadingQuest() {
  const navigate = useNavigate();

  // ── API State ──────────────────────────────────────────────────────────────
  const [levels, setLevels] = useState([]);
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  // ── Game State ─────────────────────────────────────────────────────────────
  const [showQuestion, setShowQuestion] = useState(false);
  const [waterLevel, setWaterLevel] = useState(30);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [gameStatus, setGameStatus] = useState("playing");

  // get userId from localStorage token
  const getUserId = () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return null;
      const payload = JSON.parse(atob(token.split(".")[1]));
      return (
        payload.userId ||
        payload.sub ||
        payload.nameid ||
        payload[
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
        ] ||
        null
      );
    } catch {
      return null;
    }
  };

  // ── Load levels on mount ───────────────────────────────────────────────────
  useEffect(() => {
    loadLevels();
  }, []);

  const loadLevels = async () => {
    try {
      setLoading(true);
      setApiError(null);
      const res = await shalalAPI.getLevels();
      const data = res.data?.data ?? res.data ?? [];
      setLevels(data);
      if (data.length > 0) {
        await loadQuestion(data[0].levelNumber);
      }
    } catch (e) {
      console.error("Failed to load Shalal levels:", e);
      setApiError("Failed to load levels. Using offline mode.");
      setCurrentQuestion(getFallbackQuestion());
    } finally {
      setLoading(false);
    }
  };

  const loadQuestion = async (levelNumber) => {
    try {
      const res = await shalalAPI.getRandomQuestion(levelNumber);
      const q = res.data?.data ?? res.data;
      setCurrentQuestion(q);
      setShowQuestion(false);
    } catch (e) {
      console.error("Failed to load question:", e);
      setCurrentQuestion(getFallbackQuestion());
    }
  };

  // ── Session Management ─────────────────────────────────────────────────────
  const startSession = async (levelNumber) => {
    const userId = getUserId();
    if (!userId) return;
    try {
      const res = await shalalAPI.startSession(userId, levelNumber);
      const session = res.data?.data ?? res.data;
      setSessionId(session?.id ?? null);
      setSessionStartTime(Date.now());
    } catch (e) {
      console.error("Failed to start session:", e);
    }
  };

  const recordAnswer = async (isCorrect) => {
    if (!sessionId) return;
    try {
      await shalalAPI.submitAnswer(sessionId, isCorrect);
    } catch (e) {
      console.error("Failed to record answer:", e);
    }
  };

  const finishSession = async () => {
    if (!sessionId) return;
    try {
      const timeSeconds = sessionStartTime
        ? Math.floor((Date.now() - sessionStartTime) / 1000)
        : 0;
      await shalalAPI.finishSession(sessionId, timeSeconds);
    } catch (e) {
      console.error("Failed to finish session:", e);
    }
  };

  // ── Fallback offline questions ─────────────────────────────────────────────
  const getFallbackQuestion = () => ({
    text: "Drago found a boat near the river.",
    question: "What did Drago find?",
    answer: "A Boat",
    options: ["A Car", "A Boat"],
  });

  // ── Sound ──────────────────────────────────────────────────────────────────
  const playSound = (type) => {
    const sounds = {
      correct: "/sounds/correct.mp3",
      wrong: "/sounds/wrong.mp3",
    };
    new Audio(sounds[type])?.play()?.catch(() => {});
  };

  // ── TTS ────────────────────────────────────────────────────────────────────
  const speakText = (text) => {
    if (!("speechSynthesis" in window)) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US";
    u.rate = 0.8;
    window.speechSynthesis.speak(u);
  };

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleNextClick = async () => {
    setShowQuestion(true);
    setFeedback(null);
    // Start session when player begins quiz
    if (levels.length > 0 && !sessionId) {
      await startSession(levels[currentLevelIndex]?.levelNumber ?? 1);
    }
  };

  const handleOptionClick = async (selectedOption) => {
    if (feedback) return;

    const correctAnswer = currentQuestion?.answer;
    const isCorrect =
      selectedOption === correctAnswer ||
      selectedOption?.toLowerCase() === correctAnswer?.toLowerCase();

    await recordAnswer(isCorrect);

    if (isCorrect) {
      setFeedback("correct");
      setScore((s) => s + 10);
      setWaterLevel((w) => Math.max(0, w - 10));
      playSound("correct");

      setTimeout(async () => {
        const nextLevelIndex = currentLevelIndex + 1;
        if (levels[nextLevelIndex]) {
          setCurrentLevelIndex(nextLevelIndex);
          await loadQuestion(levels[nextLevelIndex].levelNumber);
          setShowQuestion(false);
          setFeedback(null);
        } else {
          await finishSession();
          setGameStatus("won");
        }
      }, 1500);
    } else {
      setFeedback("wrong");
      playSound("wrong");
      setWaterLevel((w) => {
        const newLevel = Math.min(100, w + 25);
        if (newLevel >= 100) {
          finishSession().then(() => setGameStatus("lost"));
        }
        return newLevel;
      });
      setTimeout(() => setFeedback(null), 1500);
    }
  };

  const restartGame = async () => {
    setCurrentLevelIndex(0);
    setShowQuestion(false);
    setWaterLevel(30);
    setScore(0);
    setFeedback(null);
    setGameStatus("playing");
    setSessionId(null);
    setSessionStartTime(null);
    await loadLevels();
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className={styles.gameContainer}>
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: "1rem",
            color: "#fff",
          }}
        >
          <div
            style={{ fontSize: "3rem", animation: "spin 1s linear infinite" }}
          >
            ⚙️
          </div>
          <p style={{ fontSize: "1.2rem" }}>Loading adventure...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  const q = currentQuestion;
  const options = q?.options ?? ["Option A", "Option B"];
  const totalLevels = levels.length || 1;

  return (
    <div className={styles.gameContainer}>
      <nav className={styles.headerNav}>
        <div className={styles.scoreBoard}>⭐ Score: {score}</div>
        {apiError && (
          <div
            style={{
              background: "rgba(255,200,0,0.9)",
              color: "#333",
              padding: "6px 14px",
              borderRadius: 8,
              fontSize: "0.8rem",
              maxWidth: 260,
            }}
          >
            ⚠️ {apiError}
          </div>
        )}
        <button className={styles.exitBtn} onClick={() => navigate("/home")}>
          Exit Adventure
        </button>
      </nav>

      <div className={styles.mainStage}>
        <div className={styles.scrollCard}>
          {!showQuestion ? (
            <div className={styles.readingMode}>
              <h2 className={styles.segmentTitle}>
                {levels[currentLevelIndex]?.topic || "Read the Story"}
              </h2>
              <p className={styles.storyText}>{q?.text || "Loading..."}</p>
              <div className={styles.controls}>
                <button
                  className={styles.speakBtn}
                  onClick={() => speakText(q?.text || "")}
                >
                  🔊 Listen
                </button>
                <button className={styles.primaryBtn} onClick={handleNextClick}>
                  Start Quiz ➜
                </button>
              </div>
            </div>
          ) : (
            <div className={styles.quizMode}>
              <h2 className={styles.questionText}>
                {q?.question || "What did you read?"}
              </h2>
              <div className={styles.optionsGrid}>
                {options.map((opt, idx) => {
                  const isCorrect =
                    opt === q?.answer ||
                    opt?.toLowerCase() === q?.answer?.toLowerCase();
                  return (
                    <button
                      key={idx}
                      className={`${styles.optionCard} ${
                        feedback === "correct" && isCorrect
                          ? styles.correctCard
                          : ""
                      } ${
                        feedback === "wrong" && !isCorrect
                          ? styles.dimmedCard
                          : ""
                      }`}
                      onClick={() => handleOptionClick(opt)}
                    >
                      <span className={styles.optText}>{opt}</span>
                    </button>
                  );
                })}
              </div>
              {feedback && (
                <div className={`${styles.feedbackMsg} ${styles[feedback]}`}>
                  {feedback === "correct"
                    ? "Great! Boat is steady. 🚢"
                    : "Oh no! Drifting closer! 🌊"}
                </div>
              )}
            </div>
          )}
        </div>

        <div className={styles.progressText}>
          Level {currentLevelIndex + 1} / {totalLevels}
        </div>
      </div>

      <div className={styles.riverFooter}>
        <div className={styles.dangerLabel}>⚠️ DANGER ZONE</div>
        <div className={styles.waterSurface} />
        <div className={styles.waterPath}>
          <div
            className={styles.waterLevel}
            style={{ width: `${waterLevel}%` }}
          >
            <div className={styles.dynamicBoat}>
              <BoatSVG className={styles.svgGraphic} />
              <div className={styles.boatRipple} />
            </div>
          </div>
          <div className={styles.dynamicDanger}>
            <TornadoSVG className={styles.svgGraphic} />
          </div>
        </div>
      </div>

      {gameStatus === "won" ? (
        <WinModal score={score} restartGame={restartGame}>
          You safely navigated all levels! 🏝️
        </WinModal>
      ) : gameStatus === "lost" ? (
        <LoseModal score={score} restartGame={restartGame}>
          The current was too strong. Try again!
        </LoseModal>
      ) : null}
    </div>
  );
}

export default ReadingQuest;
