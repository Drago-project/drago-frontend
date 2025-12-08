// src/games/WinLose.jsx
import sad from "../assets/emotions/drago(crying).svg";
import celebrationAnimation from "../assets/animation/celebration drago.json";
import styles from "../styles/WinLose.module.css";
import Lottie from "lottie-react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Confetti from "react-confetti";

// دالة تشغيل الأصوات
const playSound = (type) => {
  const sounds = {
    win: "/sounds/win.mp3",
    lose: "/sounds/lose.mp3",
  };
  const soundPath = sounds[type];
  if (soundPath) {
    const audio = new Audio(soundPath);
    audio.play().catch((e) => console.log(`Sound play error for ${type}:`, e));
  }
};

export function WinModal({ score, restartGame, children }) {
  const navigate = useNavigate();

  useEffect(() => {
    playSound("win");
  }, []);

  return (
    <div className={styles.modalOverlay}>
      <Confetti
        width={window.innerWidth}
        height={window.innerHeight}
        recycle={true}
      />
      <div className={`${styles.modal} ${styles.win}`}>
        <div className={styles.modalEmoji}>
          <Lottie
            animationData={celebrationAnimation}
            loop={true}
            autoplay={true}
          />
        </div>
        <h2 className={styles.modalTitle}>!أنت بطل</h2>
        <p className={styles.modalSubtitle}>{children}</p>
        <p className={styles.modalScore}>النتيجة النهائية: {score}</p>
        <div className={styles.btnContainer}>
          <button className={styles.modalBtn} onClick={restartGame}>
            العب مجدداً
          </button>
          <button className={styles.exitBtn} onClick={() => navigate("/home")}>
            خروج
          </button>
        </div>
      </div>
    </div>
  );
}

export function LoseModal({ score, restartGame, children }) {
  const navigate = useNavigate();

  useEffect(() => {
    playSound("lose");
  }, []);

  return (
    <div className={styles.modalOverlay}>
      <div className={`${styles.modal} ${styles.lose}`}>
        <div className={styles.modalEmoji}>
          <img src={sad} alt="Sad Drago" className={styles.sadAnimation} />
        </div>
        <h2 className={styles.modalTitle}>!انتهت القلوب</h2>
        <p className={styles.modalSubtitle}>{children}</p>
        <p className={styles.modalScore}>النتيجة النهائية: {score}</p>
        <div className={styles.btnContainer}>
          <button className={styles.modalBtn} onClick={restartGame}>
            حاول مرة أخرى
          </button>
          <button className={styles.exitBtn} onClick={() => navigate("/home")}>
            خروج
          </button>
        </div>
      </div>
    </div>
  );
}
