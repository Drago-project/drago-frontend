import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Confetti from "react-confetti"; // 1. استدعاء مكتبة الاحتفالات
import styles from "../styles/ReadingQuest.module.css";

// استدعاء البيانات والرسومات من ملفاتهم الخارجية
import { STORY_DATA } from "../data/stories";
import { BoatSVG, TornadoSVG } from "../components/GameIcons";

function ReadingQuest() {
  const navigate = useNavigate();
  const [currentSegment, setCurrentSegment] = useState(0);
  const [showQuestion, setShowQuestion] = useState(false);
  const [waterLevel, setWaterLevel] = useState(30);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [gameStatus, setGameStatus] = useState("playing");

  const activeStory = STORY_DATA[currentSegment];

  // 🔊 دالة تشغيل الأصوات
  const playSound = (type) => {
    const sounds = {
      correct: "/sounds/correct.mp3",
      wrong: "/sounds/wrong.mp3",
      win: "/sounds/win.mp3",
      lose: "/sounds/lose.mp3",
    };
    // التأكد من وجود الصوت قبل تشغيله لتجنب الأخطاء
    const audio = new Audio(sounds[type]);
    audio.play().catch((e) => console.log("Sound play error:", e));
  };

  // 🗣️ دالة القراءة
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
      playSound("correct"); // صوت صح

      setTimeout(() => {
        if (currentSegment < STORY_DATA.length - 1) {
          setCurrentSegment(currentSegment + 1);
          setShowQuestion(false);
          setFeedback(null);
        } else {
          setGameStatus("won");
          playSound("win"); // صوت الفوز
        }
      }, 1500);
    } else {
      setFeedback("wrong");
      playSound("wrong"); // صوت غلط

      // زيادة مستوى الخطر
      const newLevel = Math.min(100, waterLevel + 25);
      setWaterLevel(newLevel);

      if (newLevel >= 100) {
        setGameStatus("lost");
        playSound("lose"); // صوت الخسارة
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
      {/* 2. إضافة الاحتفال لما يكسب */}
      {gameStatus === "won" && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={true}
        />
      )}

      {/* منطقة القصة والأسئلة */}
      <div className={styles.mainStage}>
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
                <button className={styles.primaryBtn} onClick={handleNextClick}>
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
                    ? "Great! Boat is steady."
                    : "Oh no! Drifting closer!"}
                </div>
              )}
            </div>
          )}
        </div>
        <div className={styles.progressText}>
          Part {currentSegment + 1} / {STORY_DATA.length}
        </div>
      </div>

      {/* الفوتر: النهر والرسومات */}
      <div className={styles.riverFooter}>
        <div className={styles.dangerLabel}>⚠️ DANGER ZONE</div>
        <div className={styles.waterSurface}></div>

        <div className={styles.waterPath}>
          <div
            className={styles.waterLevel}
            style={{ width: `${waterLevel}%` }}
          >
            <div className={styles.dynamicBoat}>
              {/* استدعاء أيقونة المركب */}
              <BoatSVG className={styles.svgGraphic} />
              <div className={styles.boatRipple}></div>
            </div>
          </div>
          <div className={styles.dynamicDanger}>
            {/* استدعاء أيقونة الإعصار */}
            <TornadoSVG className={styles.svgGraphic} />
          </div>
        </div>
      </div>

      {/* نوافذ الفوز والخسارة */}
      {gameStatus === "won" && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h1>🏝️ Safe Arrival!</h1>
            <h2>Final Score: {score}</h2>
            <button className={styles.primaryBtn} onClick={restartGame}>
              Play Again
            </button>
            <button
              className={styles.exitBtn}
              onClick={() => navigate("/home")}
            >
              Exit
            </button>
          </div>
        </div>
      )}

      {gameStatus === "lost" && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h1>🌊 You fell!</h1>
            <p>The current was too strong.</p>
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
