// المسار: src/games/ReadingQuest.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
// 👇 ده السطر اللي اتصلح عشان يقرا من فولدر styles
import styles from "../styles/ReadingQuest.module.css";

const STORY_DATA = [
  {
    id: 1,
    text: "Drago found a boat near the river.",
    question: "What did Drago find?",
    options: [
      { id: "a", text: "A Car", emoji: "🚗", isCorrect: false },
      { id: "b", text: "A Boat", emoji: "🛶", isCorrect: true },
    ],
  },
  {
    id: 2,
    text: "The river flows very fast towards the waterfall.",
    question: "Where does the river go?",
    options: [
      { id: "a", text: "Waterfall", emoji: "🌊", isCorrect: true },
      { id: "b", text: "Desert", emoji: "🌵", isCorrect: false },
    ],
  },
  {
    id: 3,
    text: "Drago needs to paddle to stay safe.",
    question: "What should Drago do?",
    options: [
      { id: "a", text: "Sleep", emoji: "😴", isCorrect: false },
      { id: "b", text: "Paddle", emoji: "🚣", isCorrect: true },
    ],
  },
];

function ReadingQuest() {
  const navigate = useNavigate();
  const [currentSegment, setCurrentSegment] = useState(0);
  const [showQuestion, setShowQuestion] = useState(false);
  const [waterLevel, setWaterLevel] = useState(30);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [gameStatus, setGameStatus] = useState("playing");

  const activeStory = STORY_DATA[currentSegment];

  const speakText = (text) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Browser does not support text-to-speech");
    }
  };

  const handleNextClick = () => {
    setShowQuestion(true);
    setFeedback(null);
  };

  const handleOptionClick = (isCorrect) => {
    if (feedback) return;

    if (isCorrect) {
      setFeedback("correct");
      setScore(score + 10);
      setWaterLevel((prev) => Math.max(10, prev - 20));

      setTimeout(() => {
        if (currentSegment < STORY_DATA.length - 1) {
          setCurrentSegment(currentSegment + 1);
          setShowQuestion(false);
          setFeedback(null);
        } else {
          setGameStatus("won");
        }
      }, 1500);
    } else {
      setFeedback("wrong");
      setWaterLevel((prev) => Math.min(100, prev + 25));

      if (waterLevel + 25 >= 100) {
        setGameStatus("lost");
      } else {
        setTimeout(() => {
          setFeedback(null);
        }, 1500);
      }
    }
  };

  const restartGame = () => {
    setCurrentSegment(0);
    setShowQuestion(false);
    setWaterLevel(30);
    setScore(0);
    setFeedback(null);
    setGameStatus("playing");
  };

  return (
    <div className={styles.gameContainer}>
      <nav className={styles.headerNav}>
        <div className={styles.scoreBoard}>⭐ Score: {score}</div>
        <button className={styles.exitBtn} onClick={() => navigate("/home")}>
          Exit Adventure
        </button>
      </nav>

      <div className={styles.gameContent}>
        <div className={styles.interactionPanel}>
          <div className={styles.scrollCard}>
            {!showQuestion ? (
              <div className={styles.readingMode}>
                <h2 className={styles.segmentTitle}>Read the Story</h2>
                <p className={styles.storyText}>{activeStory.text}</p>
                <div className={styles.controls}>
                  <button
                    className={styles.speakBtn}
                    onClick={() => speakText(activeStory.text)}
                  >
                    🔊 Listen
                  </button>
                  <button
                    className={styles.primaryBtn}
                    onClick={handleNextClick}
                  >
                    Start Quiz ➜
                  </button>
                </div>
              </div>
            ) : (
              <div className={styles.quizMode}>
                <h2 className={styles.questionText}>{activeStory.question}</h2>
                <div className={styles.optionsGrid}>
                  {activeStory.options.map((opt) => (
                    <button
                      key={opt.id}
                      className={`${styles.optionCard} ${
                        feedback === "correct" && opt.isCorrect
                          ? styles.correctCard
                          : ""
                      } ${
                        feedback === "wrong" && !opt.isCorrect
                          ? styles.dimmedCard
                          : ""
                      }`}
                      onClick={() => handleOptionClick(opt.isCorrect)}
                    >
                      <span className={styles.emoji}>{opt.emoji}</span>
                      <span className={styles.optText}>{opt.text}</span>
                    </button>
                  ))}
                </div>
                {feedback && (
                  <div className={`${styles.feedbackMsg} ${styles[feedback]}`}>
                    {feedback === "correct"
                      ? "🛶 Great! Keeping the boat safe."
                      : "🌊 Oh no! Drifting towards the waterfall!"}
                  </div>
                )}
              </div>
            )}
          </div>
          <div
            style={{
              textAlign: "center",
              color: "#01579B",
              fontWeight: "bold",
            }}
          >
            Part {currentSegment + 1} of {STORY_DATA.length}
          </div>
        </div>

        <div className={styles.visualPanel}>
          <div className={styles.riverContainer}>
            <div className={styles.dangerLabel}>⚠️ WATERFALL AHEAD</div>
            <div className={styles.waterPath}>
              <div
                className={styles.waterLevel}
                style={{ width: `${waterLevel}%` }}
              >
                <div className={styles.boatIcon}>🛶</div>
              </div>
              <div className={styles.dangerIcon}>🌪️</div>
            </div>
          </div>
        </div>
      </div>

      {gameStatus === "won" && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h1>🏝️ Safe Arrival!</h1>
            <p>You guided Drago safely across the river.</p>
            <h2>Final Score: {score}</h2>
            <button className={styles.primaryBtn} onClick={restartGame}>
              Play Again
            </button>
            <button
              className={styles.exitBtn}
              onClick={() => navigate("/home")}
              style={{ marginLeft: "10px" }}
            >
              Exit
            </button>
          </div>
        </div>
      )}

      {gameStatus === "lost" && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h1>🌊 Waterfall!</h1>
            <p>The current was too strong. Try again!</p>
            <button className={styles.primaryBtn} onClick={restartGame}>
              Retry
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReadingQuest;
