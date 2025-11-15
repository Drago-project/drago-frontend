import React, { useState, useEffect, useRef, useMemo } from "react";

// Inline styles matching the DracoLearn design
const styles = `
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.game-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #1a2332 0%, #0d1117 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
  display: flex;
  flex-direction: column;
}

/* Header Navigation */
.header-nav {
  background: #1a2332;
  padding: 15px 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #44968e 0%, #2d7a73 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.logo-text {
  font-size: 28px;
  font-weight: 700;
  color: #fff;
}

.game-title {
  font-size: 24px;
  font-weight: 600;
  color: #fff;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.hearts-container {
  display: flex;
  gap: 8px;
}

.heart {
  font-size: 32px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.exit-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  padding: 10px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.exit-btn:hover {
  background: rgba(255, 255, 255, 0.15);
}

/* Main Game Area */
.game-content {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  padding: 40px 60px;
  align-items: center;
}

/* Left Panel - Word Card */
.word-panel {
  display: flex;
  flex-direction: column;
  gap: 30px;
  max-width: 550px;
  margin: 0 auto;
}

.word-card {
  background: #f5f3e8;
  border-radius: 20px;
  padding: 60px 40px;
  text-align: center;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  min-height: 400px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.word-display {
  font-size: 72px;
  font-weight: 900;
  color: #1a2332;
  letter-spacing: 2px;
  margin-bottom: 20px;
  text-transform: uppercase;
}

.feedback-message {
  margin-top: 20px;
  font-size: 18px;
  font-weight: 600;
  padding: 12px;
  border-radius: 8px;
  animation: fadeIn 0.3s ease;
}

.feedback-correct {
  color: #4caf50;
  background: rgba(76, 175, 80, 0.1);
}

.feedback-wrong {
  color: #f44336;
  background: rgba(244, 67, 54, 0.1);
}

.transcript-text {
  margin-top: 15px;
  font-size: 16px;
  color: #666;
  font-style: italic;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 20px;
  justify-content: center;
}

.action-btn {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  border: 3px solid #1a2332;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 28px;
}

.action-btn.primary {
  width: 80px;
  height: 80px;
  background: #1a2332;
  border-color: #44968e;
}

.action-btn.primary:hover:not(:disabled) {
  background: #2d3a4d;
  transform: scale(1.05);
}

.action-btn:hover:not(:disabled) {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.action-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.word-counter {
  text-align: center;
  font-size: 20px;
  font-weight: 600;
  color: #fff;
  margin-top: 10px;
}

/* Right Panel - Volcano */
.volcano-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
}

.dragon-container {
  position: relative;
  margin-bottom: 20px;
  animation: float 3s ease-in-out infinite;
}

.dragon-image {
  width: 180px;
  height: auto;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.3));
}

.dragon-scroll {
  position: absolute;
  top: 50%;
  right: -40px;
  transform: translateY(-50%);
  background: #f5e6d3;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  color: #8b4513;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  white-space: nowrap;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-15px); }
}

/* Volcano Container */
.volcano-container {
  position: relative;
  width: 320px;
  height: 500px;
  background: linear-gradient(180deg, #5a6978 0%, #3d4a5c 100%);
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
  overflow: hidden;
  border: 4px solid #2d3a4d;
}

/* Top Platform */
.volcano-top {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: linear-gradient(180deg, #6b7a8f 0%, #5a6978 100%);
  border-bottom: 3px solid #4a5768;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
}

.volcano-top::before {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 80%;
  height: 10px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 50%;
}

/* Lava Level */
.lava-container {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  top: 60px;
}

.lava-level {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(180deg, #ff6b35 0%, #ff4500 50%, #dc143c 100%);
  transition: height 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 -10px 30px rgba(255, 69, 0, 0.6);
}

.lava-surface {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 30px;
  background: linear-gradient(180deg, #ffaa00 0%, #ff6b35 100%);
  animation: lavaSurface 2s ease-in-out infinite;
}

@keyframes lavaSurface {
  0%, 100% { transform: scaleY(1); }
  50% { transform: scaleY(1.1); }
}

/* Lava Bubbles */
.lava-bubble {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, #ffcc00, #ff8800);
  animation: bubbleRise 3s ease-in-out infinite;
  opacity: 0.7;
}

@keyframes bubbleRise {
  0% {
    transform: translateY(0) scale(1);
    opacity: 0.7;
  }
  50% {
    opacity: 0.9;
  }
  100% {
    transform: translateY(-60px) scale(0.5);
    opacity: 0;
  }
}

/* Percentage Markers */
.percentage-markers {
  position: absolute;
  right: -50px;
  top: 60px;
  bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 10px 0;
}

.marker {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 5px;
}

.marker::before {
  content: '';
  width: 15px;
  height: 2px;
  background: rgba(255, 255, 255, 0.5);
}

/* Feedback Indicators */
.feedback-indicator {
  position: absolute;
  font-size: 24px;
  font-weight: 700;
  padding: 8px 16px;
  border-radius: 20px;
  animation: slideInOut 1.5s ease;
  z-index: 20;
}

.feedback-indicator.correct {
  background: #4caf50;
  color: #fff;
  left: -80px;
  top: 30%;
}

.feedback-indicator.wrong {
  background: #f44336;
  color: #fff;
  left: -80px;
  top: 40%;
}

@keyframes slideInOut {
  0% { transform: translateX(-20px); opacity: 0; }
  20% { transform: translateX(0); opacity: 1; }
  80% { transform: translateX(0); opacity: 1; }
  100% { transform: translateX(-20px); opacity: 0; }
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal {
  background: #fff;
  border-radius: 20px;
  padding: 50px;
  text-align: center;
  max-width: 450px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  animation: scaleIn 0.3s ease;
}

@keyframes scaleIn {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.modal.win {
  background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
  color: #fff;
}

.modal.lose {
  background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
  color: #fff;
}

.modal-emoji {
  font-size: 80px;
  margin-bottom: 20px;
}

.modal-title {
  font-size: 42px;
  font-weight: 900;
  margin-bottom: 15px;
}

.modal-subtitle {
  font-size: 20px;
  margin-bottom: 10px;
  opacity: 0.95;
}

.modal-score {
  font-size: 18px;
  margin-bottom: 30px;
  opacity: 0.9;
}

.modal-btn {
  background: #fff;
  color: #1a2332;
  border: none;
  padding: 15px 40px;
  border-radius: 10px;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
}

.modal-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

/* Responsive Design */
@media (max-width: 1200px) {
  .game-content {
    grid-template-columns: 1fr;
    gap: 40px;
    padding: 30px;
  }
  
  .percentage-markers {
    right: -45px;
  }
}

@media (max-width: 768px) {
  .header-nav {
    padding: 12px 20px;
  }
  
  .logo-text {
    font-size: 22px;
  }
  
  .game-title {
    font-size: 18px;
  }
  
  .heart {
    font-size: 24px;
  }
  
  .word-display {
    font-size: 56px;
  }
  
  .volcano-container {
    width: 280px;
    height: 450px;
  }
  
  .dragon-image {
    width: 140px;
  }
}
`;

const WORDS = [
  "lava",
  "magma",
  "eruption",
  "ash",
  "crater",
  "volcano",
  "dragon",
  "read",
  "book",
  "fire"
];

function VolcanoWords() {
  const [wordIndex, setWordIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [hints, setHints] = useState(3);
  const [lavaLevel, setLavaLevel] = useState(50);
  const [isRecording, setIsRecording] = useState(false);
  const [showWinModal, setShowWinModal] = useState(false);
  const [showLoseModal, setShowLoseModal] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [showFeedbackIndicator, setShowFeedbackIndicator] = useState(false);

  const recognitionRef = useRef(null);
  const currentWord = useMemo(() => WORDS[wordIndex], [wordIndex]);

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 3;

    recognition.onstart = () => {
      setIsRecording(true);
      setTranscript("");
      setFeedback(null);
    };

    recognition.onresult = (event) => {
      let finalTranscript = "";
      for (let i = 0; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      setTranscript(finalTranscript);
      handleWordSubmitted(finalTranscript);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const normalizeText = (text) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s]/g, "")
      .replace(/\s+/g, ' '); // normalize spaces
  };

  const evaluateTranscript = (transcript) => {
    if (!transcript) return false;
    
    const normalized = normalizeText(transcript);
    const wordNormalized = normalizeText(currentWord);
    
    console.log("Comparing:", { 
      spoken: normalized, 
      expected: wordNormalized,
      match: normalized === wordNormalized || normalized.includes(wordNormalized)
    });
    
    // Check exact match first
    if (normalized === wordNormalized) return true;
    
    // Check if the word is contained in the transcript
    const words = normalized.split(' ');
    if (words.includes(wordNormalized)) return true;
    
    // Check if transcript contains the word
    if (normalized.includes(wordNormalized)) return true;
    
    // Check for very close matches (allowing for slight speech recognition errors)
    // Calculate similarity
    const similarity = calculateSimilarity(normalized, wordNormalized);
    console.log("Similarity score:", similarity);
    
    // If similarity is high (80% or more), consider it correct
    return similarity >= 0.8;
  };

  // Simple similarity calculation
  const calculateSimilarity = (str1, str2) => {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = getEditDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  };

  // Levenshtein distance algorithm
  const getEditDistance = (str1, str2) => {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  };

  const handleWordSubmitted = (spokenText) => {
    if (!spokenText || spokenText.trim() === "") return;
    
    const isCorrect = evaluateTranscript(spokenText);
    setFeedback(isCorrect ? "correct" : "wrong");
    setShowFeedbackIndicator(true);

    setTimeout(() => setShowFeedbackIndicator(false), 1500);

    if (isCorrect) {
      // Correct answer: add score and move lava DOWN
      const newScore = score + 10;
      setScore(newScore);
      const newLavaLevel = Math.max(0, lavaLevel - 10);
      setLavaLevel(newLavaLevel);

      // Check win condition: lava reaches 0%
      if (newLavaLevel <= 0) {
        setTimeout(() => setShowWinModal(true), 1000);
        return;
      }

      // Move to next word after delay
      setTimeout(() => {
        if (wordIndex < WORDS.length - 1) {
          setWordIndex(wordIndex + 1);
          setTranscript("");
          setFeedback(null);
        } else {
          // Completed all words successfully
          setShowWinModal(true);
        }
      }, 1500);
    } else {
      // Wrong answer: move lava UP (stay on same word)
      const newLavaLevel = Math.min(100, lavaLevel + 10);
      setLavaLevel(newLavaLevel);

      // Check lose condition: lava reaches 100%
      if (newLavaLevel >= 100) {
        setTimeout(() => setShowLoseModal(true), 1000);
        return;
      }

      // Clear feedback after delay but stay on same word
      setTimeout(() => {
        setTranscript("");
        setFeedback(null);
      }, 1500);
    }
  };

  const startRecording = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition not available. Please use Chrome or Edge browser.");
      return;
    }
    
    if (isRecording) {
      recognitionRef.current.stop();
      return;
    }
    
    try {
      recognitionRef.current.start();
    } catch (err) {
      console.error("Error starting recognition:", err);
      // If already running, stop and restart
      if (err.message.includes('already started')) {
        recognitionRef.current.stop();
        setTimeout(() => {
          try {
            recognitionRef.current.start();
          } catch (e) {
            console.error("Failed to restart:", e);
          }
        }, 100);
      }
    }
  };

  const playWordHint = () => {
    if (hints <= 0) return;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(currentWord);
      utterance.lang = 'en-US';
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 1;
      window.speechSynthesis.speak(utterance);
      setHints(hints - 1);
    }
  };

  const skipWord = () => {
    // Skipping a word should be a penalty
    const newLavaLevel = Math.min(100, lavaLevel + 5);
    setLavaLevel(newLavaLevel);
    
    if (newLavaLevel >= 100) {
      setTimeout(() => setShowLoseModal(true), 500);
      return;
    }
    
    if (wordIndex < WORDS.length - 1) {
      setWordIndex(wordIndex + 1);
      setTranscript("");
      setFeedback(null);
    } else {
      // If on last word, show completion
      setShowWinModal(true);
    }
  };

  const playAgain = () => {
    setWordIndex(0);
    setScore(0);
    setHints(3);
    setLavaLevel(50);
    setShowWinModal(false);
    setShowLoseModal(false);
    setTranscript("");
    setFeedback(null);
  };

  return (
    <div className="game-container">
      <style>{styles}</style>
      
      {/* Header Navigation */}
      <nav className="header-nav">
        <div className="logo-section">
          <div className="logo-icon">🐲</div>
          <div className="logo-text">DracoLearn</div>
        </div>
        
        <div className="game-title">Lava Challenge</div>
        
        <div className="header-right">
          <div className="hearts-container">
            {[...Array(hints)].map((_, i) => (
              <span key={i} className="heart">💛</span>
            ))}
          </div>
          <button className="exit-btn">Exit</button>
        </div>
      </nav>

      {/* Main Game Content */}
      <div className="game-content">
        {/* Left Panel - Word Card */}
        <div className="word-panel">
          <div className="word-card">
            <div className="word-display">{currentWord.toUpperCase()}</div>
            
            {feedback && (
              <div className={`feedback-message feedback-${feedback}`}>
                {feedback === "correct" ? "✓ Correct! Well done!" : "✗ Try again!"}
              </div>
            )}
            
            {transcript && (
              <div className="transcript-text">
                You said: "{transcript}"
                {feedback && feedback === "wrong" && (
                  <div style={{ marginTop: '8px', fontSize: '14px', color: '#f44336' }}>
                    Expected: "{currentWord}"
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="action-buttons">
            <button 
              className="action-btn primary" 
              onClick={startRecording}
              disabled={lavaLevel >= 100 || lavaLevel <= 0}
            >
              🎤
            </button>
            <button 
              className="action-btn" 
              onClick={playWordHint}
              disabled={hints <= 0}
            >
              💡
            </button>
            <button 
              className="action-btn" 
              onClick={skipWord}
            >
              ↻
            </button>
          </div>
          
          <div className="word-counter">
            {wordIndex + 1}/{WORDS.length}
          </div>
        </div>

        {/* Right Panel - Volcano */}
        <div className="volcano-panel">
          <div className="dragon-container">
            <div className="dragon-image">🐉</div>
            <div className="dragon-scroll">ancient spell #103</div>
          </div>
          
          <div style={{ position: 'relative' }}>
            <div className="volcano-container">
              <div className="volcano-top"></div>
              
              <div className="lava-container">
                <div className="lava-level" style={{ height: `${lavaLevel}%` }}>
                  <div className="lava-surface"></div>
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="lava-bubble"
                      style={{
                        width: `${15 + Math.random() * 20}px`,
                        height: `${15 + Math.random() * 20}px`,
                        left: `${10 + i * 12}%`,
                        bottom: `${Math.random() * 30}px`,
                        animationDelay: `${i * 0.4}s`,
                        animationDuration: `${2 + Math.random() * 2}s`
                      }}
                    />
                  ))}
                </div>
              </div>
              
              {showFeedbackIndicator && (
                <div className={`feedback-indicator ${feedback}`}>
                  {feedback === "correct" ? "✓ +1" : "✗ -1"}
                </div>
              )}
            </div>
            
            <div className="percentage-markers">
              <div className="marker">100%</div>
              <div className="marker">0%</div>
              <div className="marker">50%</div>
              <div className="marker">75%</div>
              <div className="marker">0</div>
            </div>
          </div>
        </div>
      </div>

      {/* Win Modal */}
      {showWinModal && (
        <div className="modal-overlay">
          <div className="modal win">
            <div className="modal-emoji">🎉</div>
            <h2 className="modal-title">You Won!</h2>
            <p className="modal-subtitle">Drago escaped the volcano!</p>
            <p className="modal-score">Final Score: {score}</p>
            <button onClick={playAgain} className="modal-btn">Play Again</button>
          </div>
        </div>
      )}

      {/* Lose Modal */}
      {showLoseModal && (
        <div className="modal-overlay">
          <div className="modal lose">
            <div className="modal-emoji">😢</div>
            <h2 className="modal-title">Game Over!</h2>
            <p className="modal-subtitle">The lava got too high!</p>
            <p className="modal-score">Final Score: {score}</p>
            <button onClick={playAgain} className="modal-btn">Try Again</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default VolcanoWords;