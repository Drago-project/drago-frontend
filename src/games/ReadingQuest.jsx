import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/ReadingQuest.module.css";

const STORY_DATA = [
  {
    id: 1,
    text: "Drago found an old map inside a blue bottle.",
    question: "What was inside the bottle?",
    options: [
      { id: "a", text: "A Map", emoji: "🗺️", isCorrect: true },
      { id: "b", text: "A Key", emoji: "🗝️", isCorrect: false },
    ],
  },
  {
    id: 2,
    text: "The map showed a secret cave behind the waterfall.",
    question: "Where is the cave?",
    options: [
      { id: "a", text: "Under a Tree", emoji: "🌳", isCorrect: false },
      { id: "b", text: "Behind Waterfall", emoji: "🌊", isCorrect: true },
    ],
  },
  {
    id: 3,
    text: "Drago used his fire to light up the dark cave.",
    question: "How did Drago make light?",
    options: [
      { id: "a", text: "Flashlight", emoji: "🔦", isCorrect: false },
      { id: "b", text: "Fire", emoji: "🔥", isCorrect: true },
    ],
  },
];

function ReadingQuest() {
  const navigate = useNavigate();
  const [currentSegment, setCurrentSegment] = useState(0);
  const [showQuestion, setShowQuestion] = useState(false);
  const [waterLevel, setWaterLevel] = useState(40);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [gameStatus, setGameStatus] = useState("playing");

  const activeStory = STORY_DATA[currentSegment];

  // كود الفقاعات المتحركة
  const [bubbles] = useState(() =>
    Array.from({ length: 15 }).map((_, i) => ({
      left: `${Math.random() * 100}%`,
      width: `${Math.random() * 20 + 10}px`,
      height: `${Math.random() * 20 + 10}px`,
      animationDuration: `${Math.random() * 5 + 5}s`,
      animationDelay: `${Math.random() * 5}s`,
    }))
  );

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

  // ✅ الدالة بعد التصليح: بتسمح بالمحاولة تاني لو الإجابة غلط
  const handleOptionClick = (isCorrect) => {
    if (feedback) return;

    if (isCorrect) {
      setFeedback("correct");
      setScore(score + 10);
      setWaterLevel((prev) => Math.max(10, prev - 15));

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
      setWaterLevel((prev) => Math.min(100, prev + 20));

      if (waterLevel + 20 >= 100) {
        setGameStatus("lost");
      } else {
        // ✅ الحل: استنى ثانية ونص وشيل الرسالة عشان يقدر يجاوب تاني
        setTimeout(() => {
          setFeedback(null);
        }, 1500);
      }
    }
  };

  const restartGame = () => {
    setCurrentSegment(0);
    setShowQuestion(false);
    setWaterLevel(40);
    setScore(0);
    setFeedback(null);
    setGameStatus("playing");
  };

  return (
    <div className={styles.gameContainer}>
      {/* عنصر الفقاعات */}
      {bubbles.map((style, i) => (
        <div key={i} className={styles.bubble} style={style}></div>
      ))}

      <nav className={styles.headerNav}>
        <div className={styles.scoreBoard}>Score: {score}</div>
        <button className={styles.exitBtn} onClick={() => navigate("/home")}>
          Exit Island
        </button>
      </nav>

      <div className={styles.gameContent}>
        <div className={styles.interactionPanel}>
          <div className={styles.scrollCard}>
            {!showQuestion ? (
              <div className={styles.readingMode}>
                <h2 className={styles.segmentTitle}>Read Carefully</h2>
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
                    I'm Ready! ➜
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
                      ? "🎉 Excellent!"
                      : "🌊 Oh no! The water is rising!"}
                  </div>
                )}
              </div>
            )}
          </div>
          <div className={styles.progressText}>
            Part {currentSegment + 1} of {STORY_DATA.length}
          </div>
        </div>

        <div className={styles.visualPanel}>
          <div className={styles.templeContainer}>
            <div className={styles.columnsBg}></div>
            <div className={styles.waterContainer}>
              <div
                className={styles.waterLevel}
                style={{ height: `${waterLevel}%` }}
              >
                <div className={styles.waterSurface}></div>
              </div>
            </div>
            <div className={styles.dangerZone}>Danger Zone ⚠️</div>
          </div>
        </div>
      </div>

      {gameStatus === "won" && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h1>🏆 You Saved the Library!</h1>
            <p>Score: {score}</p>
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
            <h1>🌊 Flooded!</h1>
            <p>The water got too high. Try again!</p>
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
