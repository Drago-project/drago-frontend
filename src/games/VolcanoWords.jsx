import React, { useState, useEffect } from "react";
import styles from "../styles/VolcanoWords.module.css";
import { useNavigate } from "react-router-dom";

import reading from "../assets/emotions/drago(reading).svg"; // Assuming this asset exists
import sitting from "../assets/poses/drago(sitting).svg";
import { WinModal, LoseModal } from "../components/WinLose.jsx";

const WORDS = ["read", "book", "fire", "apple", "water", "dragon", "castle"];
const INITIAL_LAVA_LEVEL = 40; // Starting lava level (percentage)
const INITIAL_HINTS = 5; // Starting number of hints (lives)

function VolcanoWords() {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [lavaLevel, setLavaLevel] = useState(INITIAL_LAVA_LEVEL);
  const [hints, setHints] = useState(INITIAL_HINTS);
  const [score, setScore] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [feedback, setFeedback] = useState(null); // "correct" | "wrong" | null
  const [showFeedbackIndicator, setShowFeedbackIndicator] = useState(false);
  const [gameStatus, setGameStatus] = useState("playing"); // "playing" | "won" | "lost"
  const [dragoPose, setDragoPose] = useState(reading); // Default pose is reading

  const navigate = useNavigate();
  const activeWord = WORDS[currentWordIndex];
  const isGameOver = gameStatus !== "playing";
  const numWords = WORDS.length;

  // ➡️ EFFECT: Switch Drago's pose based on recording state
  useEffect(() => {
    // If recording (listening), show 'sitting' pose, otherwise show 'reading' pose
    setDragoPose(isRecording ? sitting : reading);
  }, [isRecording]);

  // --- Utility Functions ---

  const speakText = (text) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel(); // Stop any current speaking
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Browser does not support text-to-speech");
    }
  };

  // --- Game Logic Functions ---

  const handleCorrectAnswer = () => {
    setFeedback("correct");
    setShowFeedbackIndicator(true);
    setScore((prevScore) => prevScore + 10);
    // Decrease lava level on correct answer
    setLavaLevel((prev) => Math.max(0, prev - 10));

    // Move to the next word after a delay
    setTimeout(() => {
      if (currentWordIndex < WORDS.length - 1) {
        setCurrentWordIndex((prevIndex) => prevIndex + 1);
        setTranscript("");
        setFeedback(null);
        setShowFeedbackIndicator(false);
      } else {
        setGameStatus("won"); // User completed all words
      }
    }, 1500);
  };

  const handleWrongAnswer = () => {
    setFeedback("wrong");
    setShowFeedbackIndicator(true);
    // Increase lava level on wrong answer
    setLavaLevel((prev) => {
      const newLevel = Math.min(100, prev + 15);
      if (newLevel >= 100) {
        setGameStatus("lost"); // Lava level reached 100%
      }
      return newLevel;
    });

    // Allow user to try again after a delay
    setTimeout(() => {
      if (gameStatus === "playing") {
        setFeedback(null);
        setShowFeedbackIndicator(false);
      }
    }, 1500);
  };

  const handleStartRecording = () => {
    // Placeholder for actual Speech Recognition logic
    if (isGameOver) return;
    setIsRecording(true);
    setTranscript("");

    // Simulate recognition after 2 seconds (50% chance of correct)
    setTimeout(() => {
      setIsRecording(false);

      const isSimulatedCorrect = Math.random() < 0.5;

      const simulatedTranscript = isSimulatedCorrect
        ? activeWord
        : "mismatched";
      setTranscript(simulatedTranscript);

      if (isSimulatedCorrect) {
        handleCorrectAnswer();
      } else {
        handleWrongAnswer();
      }
    }, 2000);
  };

  const handleUseHint = () => {
    if (hints > 0) {
      setHints((prev) => prev - 1);
      speakText(activeWord);
    }
  };

  const handleSkipWord = () => {
    // Skip word, potentially with a penalty (e.g., increased lava)
    // setLavaLevel((prev) => Math.min(100, prev + 5));
    if (currentWordIndex < WORDS.length - 1) {
      setCurrentWordIndex((prevIndex) => prevIndex + 1);
      setTranscript("");
      setFeedback(null);
      setShowFeedbackIndicator(false);
    } else {
      setGameStatus(score > (WORDS.length / 2) * 10 ? "won" : "lost"); // Treat skipping the last word as finishing
    }
  };

  const restartGame = () => {
    setCurrentWordIndex(0);
    setLavaLevel(INITIAL_LAVA_LEVEL);
    setHints(INITIAL_HINTS);
    setScore(0);
    setIsRecording(false);
    setTranscript("");
    setFeedback(null);
    setShowFeedbackIndicator(false);
    setGameStatus("playing");
    setDragoPose(reading);
  };

  // --- Visuals ---

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
        <div className={styles.scoreBoard}>Score: {score}</div>
        <div className={styles.heartsContainer}>
          {/* Remaining hints (lives) */}
          {[...Array(INITIAL_HINTS)].map((_, i) => (
            <span
              key={i}
              className={styles.heart}
              style={{ opacity: i < hints ? 1 : 0.3 }}
            >
              💛
            </span>
          ))}
        </div>
        <button className={styles.exitBtn} onClick={() => navigate("/home")}>Exit</button>
      </nav>

      {/* Main Game Content */}
      <div className={styles.gameContent}>
        {/* Left Panel - Word Card */}
        <WordPanal
          word={activeWord}
          isRecording={isRecording}
          transcript={transcript}
          feedback={feedback}
          hints={hints}
          wordIndex={currentWordIndex}
          numWords={numWords}
          handleStartRecording={handleStartRecording}
          handleUseHint={handleUseHint}
          handleSkipWord={handleSkipWord}
          isGameOver={isGameOver}
        />
        <div className={styles.dragonContainer}>
          <img src={dragoPose} alt="Drago" className={styles.dragonImage} />
        </div>
        {/* Right Panel - Volcano */}
        <VolcanoPanel
          lavaLevel={lavaLevel}
          lavaBubbles={lavaBubbles}
          feedback={feedback}
          showFeedbackIndicator={showFeedbackIndicator}
          dragoPose={dragoPose}
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

function VolcanoPanel({
  lavaLevel,
  lavaBubbles,
  feedback,
  showFeedbackIndicator,
  // dragoPose,
}) {
  return (
    <div className={styles.volcanoPanel}>
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
            <div className={`${styles.feedbackIndicator} ${styles[feedback]}`}>
              {feedback === "correct" ? "✓ +10" : "✗ +15% Lava"}
            </div>
          )}
        </div>

        <div className={styles.percentageMarkers}>
          <div
            className={`${styles.marker} ${
              lavaLevel >= 100 ? styles.critical : ""
            }`}
          >
            100%
          </div>
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
  transcript,
  feedback,
  hints,
  wordIndex,
  numWords,
  handleStartRecording,
  handleUseHint,
  handleSkipWord,
  isGameOver,
}) {
  return (
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
            {feedback === "correct" ? "✓ Correct! Well done!" : "✗ Try again!"}
          </div>
        )}

        {/* النص المسموع (transcript) */}
        {transcript && (
          <div className={styles.transcriptText}>
            You said: "<strong>{transcript}</strong>"
            {feedback === "wrong" && (
              <div
                style={{
                  marginTop: "8px",
                  fontSize: "14px",
                  color: "#f44336",
                }}
              >
                Expected: "<strong>{word}</strong>"
              </div>
            )}
          </div>
        )}

        {/* recording */}
        {isRecording && (
          <div className={styles.feedbackMessage}>...Listening...</div>
        )}
        <div className={styles.wordCounter}>
          Word {wordIndex + 1} of {numWords}
        </div>
      </div>

      <div className={styles.actionButtons}>
        {/* microphone */}
        <ActionBtn
          icon="🎤"
          primary={true}
          disabled={isRecording || isGameOver}
          onClick={handleStartRecording}
        />
        {/* hint */}
        <ActionBtn
          icon="💡"
          disabled={hints <= 0 || isRecording || isGameOver}
          onClick={handleUseHint}
        />

        {/* next */}
        <ActionBtn
          icon="➡️"
          disabled={isRecording || isGameOver}
          onClick={handleSkipWord}
        />
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
