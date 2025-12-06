import sad from "../assets/emotions/drago(crying).svg";
import celebrationAnimation from "../assets/animation/celebration drago.json";
import Lottie from "lottie-react";
import styles from "../styles/WinLose.module.css";
export function WinModel({ score, restartGame }) {
  return (
    <div className={styles.modalOverlay}>
      <div className={`${styles.modal} ${styles.win}`}>
        <div className={styles.modalEmoji}>
          <Lottie
            animationData={celebrationAnimation}
            loop={true}
            autoplay={true}
          />
        </div>
        <h2 className={styles.modalTitle}>You Won!</h2>
        <p className={styles.modalSubtitle}>Drago escaped the volcano!</p>
        <p className={styles.modalScore}>Final Score: {score}</p>
        <button className={styles.modalBtn} onClick={restartGame}>
          Play Again
        </button>
      </div>
    </div>
  );
}

export function LoseModal({ score, restartGame }) {
  return (
    <div className={styles.modalOverlay}>
      <div className={`${styles.modal} ${styles.lose}`}>
        <div className={styles.modalEmoji}>
          <img src={sad} alt="Sad Drago" className={styles.sadAnimation} />
        </div>
        <h2 className={styles.modalTitle}>Game Over!</h2>
        <p className={styles.modalSubtitle}>The lava got too high!</p>
        <p className={styles.modalScore}>Final Score: {score}</p>
        <button className={styles.modalBtn} onClick={restartGame}>
          Try Again
        </button>
      </div>
    </div>
  );
}