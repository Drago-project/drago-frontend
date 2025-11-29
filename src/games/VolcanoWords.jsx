// import { useState } from "react";
import styles from "../styles/VolcanoWords.module.css";
import sad from "../assets/emotions/drago(crying).svg";
// import reading from "../assets/emotions/drago(reading).svg";
// import sitting from "../assets/poses/drago(sitting).svg";
import celebrationAnimation from "../assets/animation/celebration drago.json";
import Lottie from "lottie-react";

const WORDS = ["read", "book", "fire", "apple", "water", "dragon", "castle"];

function VolcanoWords({
  word = WORDS[0],
  lavaLevel = 50,
  hints = 3,
  score = 100,
  isRecording = false,
  transcript = "red",
  feedback = null, // "correct" | "wrong" | null
  showWinModal = false,
  showLoseModal = false,
  showFeedbackIndicator = false,
}) {
  const numWords = WORDS.length;
  const wordIndex = WORDS.indexOf(word);

  const lavaBubbles = [...Array(8)].map((_, i) => ({
    key: i,
    width: `${15 + Math.random() * 20}px`,
    height: `${15 + Math.random() * 20}px`,
    left: `${10 + i * 12}%`,
    bottom: `${Math.random() * 30}px`,
    animationDelay: `${i * 0.4}s`,
    animationDuration: `${2 + Math.random() * 2}s`,
  }));

  return (
    <div className={styles.gameContainer}>
      {/* Header Navigation */}
      <nav className={styles.headerNav}>
        {/* <h1 className={styles.gameTitle}>Lava Challenge</h1> */}

        <div className={styles.heartsContainer}>
          {/*remaining hints */}
          {[...Array(hints)].map((_, i) => (
            <span key={i} className={styles.heart}>
              💛
            </span>
          ))}
        </div>
        <button className={styles.exitBtn}>Exit</button>
      </nav>

      {/* Main Game Content */}
      <div className={styles.gameContent}>
        {/* Left Panel - Word Card */}
        <div className={styles.wordPanel}>
          <div className={styles.wordCard}>
            <div className={styles.wordDisplay}>{word.toUpperCase()}</div>

            {feedback && (
              <div
                className={`${styles.feedbackMessage} ${
                  feedback === "correct"
                    ? styles.feedbackCorrect
                    : styles.feedbackWrong
                }`}
              >
                {feedback === "correct"
                  ? "✓ Correct! Well done!"
                  : "✗ Try again!"}
              </div>
            )}

            {/* النص المسموع (transcript) */}
            {transcript && (
              <div className={styles.transcriptText}>
                You said: "{transcript}"
                {feedback && feedback === "wrong" && (
                  <div
                    style={{
                      marginTop: "8px",
                      fontSize: "14px",
                      color: "#f44336",
                    }}
                  >
                    Expected: "{word}"
                  </div>
                )}
              </div>
            )}

            {/* recording */}
            {isRecording && (
              <div className={styles.feedbackMessage}>...Listening...</div>
            )}
          <div className={styles.wordCounter}>
            {wordIndex >= 0 ? `${wordIndex + 1}/${numWords}` : `1/${numWords}`}
          </div>
          </div>

          <div className={styles.actionButtons}>
            {/* microphone */}
            <button
              className={`${styles.actionBtn} ${styles.primary}`}
              disabled={isRecording}
              onClick={() => console.log("Start Recording clicked")}
            >
              🎤
            </button>
            {/* hint */}
            <button
              className={styles.actionBtn}
              disabled={hints <= 0}
              onClick={() => console.log("Play Hint clicked")}
            >
              💡
            </button>
            {/* next */}
            <button
              className={styles.actionBtn}
              onClick={() => console.log("Skip Word clicked")}
            >
              ➡️
            </button>
          </div>

        </div>

        {/* Right Panel - Volcano */}
        <div className={styles.volcanoPanel}>
          {/* <div className={styles.dragonContainer}>
            <img
              src={sitting}
              alt="Sitting Drago"
              className={styles.dragonImage}
            />
            <div className={styles.dragonScroll}>ancient spell #103</div>
          </div> */}

          <div style={{ position: "relative" }}>
            <div className={styles.volcanoContainer}>
              <div className={styles.volcanoTop}></div>

              <div className={styles.lavaContainer}>
                {/* مستوى اللافا */}
                <div
                  className={styles.lavaLevel}
                  style={{ height: `${lavaLevel}%` }}
                >
                  <div className={styles.lavaSurface}></div>
                  {/* فقاعات اللافا */}
                  {lavaBubbles.map((bubble) => (
                    <div
                      key={bubble.key}
                      className={styles.lavaBubble}
                      style={bubble}
                    />
                  ))}
                </div>
              </div>

              {/* feedback indicator */}
              {showFeedbackIndicator && (
                <div className={`${styles.feedbackIndicator} ${feedback}`}>
                  {feedback === "correct" ? "✓ +1" : "✗ -1"}
                </div>
              )}
            </div>

            <div className={styles.percentageMarkers}>
              <div className={styles.marker}>100%</div>
              {/* Markers for visual representation */}
              <div className={styles.marker}>75%</div>
              <div className={styles.marker}>50%</div>
              <div className={styles.marker}>25%</div>
              <div className={styles.marker}>0%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Win Modal */}
      {showWinModal && (
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
            <button className={styles.modalBtn}>Play Again</button>
          </div>
        </div>
      )}

      {/* Lose Modal */}
      {showLoseModal && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modal} ${styles.lose}`}>
            <div className={styles.modalEmoji}>
              <img src={sad} alt="Sad Drago" className={styles.sadAnimation} />
            </div>
            <h2 className={styles.modalTitle}>Game Over!</h2>
            <p className={styles.modalSubtitle}>The lava got too high!</p>
            <p className={styles.modalScore}>Final Score: {score}</p>
            <button className={styles.modalBtn}>Try Again</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default VolcanoWords;
