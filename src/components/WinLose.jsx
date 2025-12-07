import sad from "../assets/emotions/drago(crying).svg";
import celebrationAnimation from "../assets/animation/celebration drago.json";
import styles from "../styles/WinLose.module.css";
import Lottie from "lottie-react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Confetti from "react-confetti";

// Function to handle playing sounds
const playSound = (type) => {
  const sounds = {
    win: "/sounds/win.mp3",
    lose: "/sounds/lose.mp3",
  };
  // Ensure the sound exists before attempting to play it
  const soundPath = sounds[type];
  if (soundPath) {
    const audio = new Audio(soundPath);
    audio.play().catch((e) => console.log(`Sound play error for ${type}:`, e));
  }
};

export function WinModal({ score, restartGame, children }) {
  const navigate = useNavigate();

  // Play the win sound once when the component mounts
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
        <h2 className={styles.modalTitle}>You Won!</h2>
        <p className={styles.modalSubtitle}>{children}</p>
        <p className={styles.modalScore}>Final Score: {score}</p>
        <div className={styles.btnContainer}>
          <button className={styles.modalBtn} onClick={restartGame}>
            Play Again
          </button>
          <button className={styles.exitBtn} onClick={() => navigate("/home")}>
            Exit
          </button>
        </div>
      </div>
    </div>
  );
}

export function LoseModal({ score, restartGame, children }) {
  const navigate = useNavigate();

  // Play the lose sound once when the component mounts
  useEffect(() => {
    playSound("lose");
  }, []);
  return (
    <div className={styles.modalOverlay}>
      <div className={`${styles.modal} ${styles.lose}`}>
        <div className={styles.modalEmoji}>
          <img src={sad} alt="Sad Drago" className={styles.sadAnimation} />
        </div>
        <h2 className={styles.modalTitle}>Game Over!</h2>
        <p className={styles.modalSubtitle}>{children}</p>
        <p className={styles.modalScore}>Final Score: {score}</p>
        <div className={styles.btnContainer}>
          {" "}
          {/* Using the common container class */}
          <button className={styles.modalBtn} onClick={restartGame}>
            Try Again
          </button>
          <button className={styles.exitBtn} onClick={() => navigate("/home")}>
            Exit
          </button>
        </div>
      </div>
    </div>
  );
}

