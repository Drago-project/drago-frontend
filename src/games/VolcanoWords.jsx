import React, { useState, useEffect, useRef, useMemo } from "react";
import styles from "../styles/VolcanoWords.module.css";
import breathFire from "../assets/emotions/drago(angry).svg";
import setting from "../assets/poses/drago(sitting).svg";

const WORDS = [
  "lava",
  "magma",
  "eruption",
  "ash",
  "crater",
  "volcano",
  "tectonic",
  "igneous",
  "vent",
  "fumarole",
  "dragon",
  "read",
  "book",
];

function VolcanoWords() { 
  const [wordIndex, setWordIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [progress, setProgress] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [showWinModal, setShowWinModal] = useState(false);
  const [showLoseModal, setShowLoseModal] = useState(false);

  const audioContextRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const analyserRef = useRef(null);
  const streamRef = useRef(null);

  const currentWord = useMemo(() => WORDS[wordIndex], [wordIndex]);

  // Initialize audio context
  useEffect(() => {
    const initAudio = async () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext ||
          window.webkitAudioContext)();
      }
    };
    initAudio();
  }, []);

  // Normalize transcript for comparison
  const normalizeText = (text) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s]/g, "")
      .replace(/[\u064E-\u0652]/g, ""); // Remove Arabic diacritics
  };

  // Check if transcript matches current word
  const evaluateTranscript = (transcript) => {
    const normalized = normalizeText(transcript);
    const wordNormalized = normalizeText(currentWord);

    // Allow partial matches or exact matches
    return (
      normalized.includes(wordNormalized) || wordNormalized.includes(normalized)
    );
  };

  // Silence detection recorder
  const startSilenceDetectionRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioContext = audioContextRef.current;
      const analyser = audioContext.createAnalyser();
      analyserRef.current = analyser;

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: "audio/wav" });

        // Use Whisper API fallback to Web Speech API
        try {
          const formData = new FormData();
          formData.append("file", blob);
          formData.append("model", "whisper-1");

          const response = await fetch(
            "https://api.openai.com/v1/audio/transcriptions",
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${
                  import.meta.env.VITE_OPENAI_API_KEY || ""
                }`,
              },
              body: formData,
            }
          );

          if (response.ok) {
            const data = await response.json();
            handleWordSubmitted(data.text);
          } else {
            // Fallback to Web Speech API
            handleSpeechRecognitionFallback();
          }
        } catch {
          handleSpeechRecognitionFallback();
        }

        // Cleanup stream
        stream.getTracks().forEach((track) => track.stop());
        setIsRecording(false);
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Silence detection loop
      const silenceThreshold = 0.02;
      let silenceStart = Date.now();
      const silenceDuration = 3000; // 3 seconds

      const detectSilence = () => {
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(dataArray);

        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        const isSilent = average < silenceThreshold * 256;

        if (isSilent) {
          if (Date.now() - silenceStart > silenceDuration) {
            mediaRecorder.stop();
            return;
          }
        } else {
          silenceStart = Date.now();
        }

        if (mediaRecorder.state === "recording") {
          requestAnimationFrame(detectSilence);
        }
      };

      detectSilence();
    } catch (error) {
      console.error("Error accessing microphone:", error);
      handleSpeechRecognitionFallback();
    }
  };

  // Web Speech API fallback
  const handleSpeechRecognitionFallback = () => {
    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
      alert("Speech recognition not supported in your browser");
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => setIsRecording(false);

    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          transcript += event.results[i][0].transcript;
        }
      }
      handleWordSubmitted(transcript);
    };

    recognition.start();
  };

  // Handle submitted word
  const handleWordSubmitted = (transcript) => {
    if (evaluateTranscript(transcript)) {
      const newScore = score + 10;
      const newProgress = Math.min(progress + 100 / WORDS.length, 100);
      setScore(newScore);
      setProgress(newProgress);

      if (newProgress >= 100) {
        setShowWinModal(true);
      } else {
        moveToNextWord();
      }
    } else {
      const newLives = lives - 1;
      setLives(newLives);

      if (newLives <= 0) {
        setShowLoseModal(true);
      }
    }
  };

  // Move to next word
  const moveToNextWord = () => {
    if (wordIndex < WORDS.length - 1) {
      setWordIndex(wordIndex + 1);
    }
  };

  // Play again
  const playAgain = () => {
    setWordIndex(0);
    setScore(0);
    setLives(3);
    setProgress(0);
    setShowWinModal(false);
    setShowLoseModal(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state === "recording"
      ) {
        mediaRecorderRef.current.stop();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div className={styles.volcanoGame}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.headerTitle}>Volcano Words</h1>
        <p className={styles.headerSubtitle}>
          Help Drago escape the volcano by pronouncing words correctly!
        </p>
      </div>

      {/* Main Game Container */}
      <div className={styles.mainContainer}>
        {/* Left: Game Area */}
        <div className={styles.gameArea}>
          {/* Scoreboard */}
          <div className={styles.scoreboard}>
            <div className={styles.scoreCard}>
              <p className={styles.scoreLabel}>Score</p>
              <p className={styles.scoreValue}>{score}</p>
            </div>
            <div className={styles.scoreCard}>
              <p className={styles.scoreLabel}>Lives</p>
              <p className={`${styles.scoreValue} ${styles.livesValue}`}>
                ❤️ {lives}
              </p> 
            </div>
          </div>


          {/* Word Display */}
          <div className={styles.wordDisplay}>
            <p className={styles.wordCounter}>
              Word {wordIndex + 1} of {WORDS.length}
            </p>
            <p className={styles.wordText}>{currentWord.toUpperCase()}</p>
            <p className={styles.wordHint}>Listen and say this word out loud</p>
          </div>

          {/* Buttons */}
          <div className={styles.buttonsContainer}>
            <button
              onClick={startSilenceDetectionRecording}
              disabled={isRecording}
              className={styles.recordBtn}
            >
              🎤 {isRecording ? "Recording..." : "Start Recording"}
            </button>
            <button
              onClick={() =>
                alert(`Hint: "${currentWord}" is a volcano-related word`)
              }
              className={styles.hintBtn}
            >
              💡 Hint
            </button>
          </div>
        </div>

        {/* Right: Volcano Visualization */}
        <div className={styles.volcanoContainer}>
          {/* Drago on top */}
          <div className={styles.dragoCharacter}>
            <img src={lives > 0 ? setting : breathFire} alt="Drago" />
          </div>

          {/* Volcano Tank */}
          <div className={styles.volcanoBg}>
            {/* Safety zone indicator */}
            <div className={styles.safetyZone} />

            {/* Lava level */}
            <div
              className={styles.lavaLevel}
              style={{ height: `${progress}%` }}
            >
              {/* Animated lava bubbles */}
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`${styles.lavaBubble} ${styles.bubbleAnimation}`}
                  style={{
                    width: `${20 + i * 10}px`,
                    height: `${20 + i * 10}px`,
                    left: `${15 + i * 15}%`,
                    animationDelay: `${i * 0.3}s`,
                  }}
                />
              ))}

              {/* Fire/smoke effect */}
              <div className={styles.fireEffect}>
                {[...Array(3)].map((_, i) => (
                  <div
                    key={`fire-${i}`}
                    className={`${styles.fireEffect} ${styles.fireAnimation}`}
                    style={{
                      width: `${30 + i * 15}px`,
                      height: `${30 + i * 15}px`,
                      left: `${20 + i * 20}%`,
                      top: `${10 + i * 15}%`,
                      animationDelay: `${i * 0.4}s`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Status text */}
          <p className={styles.lavaStatus}>
            Lava Level: {Math.round(progress)}%
          </p>
        </div>
      </div>

      {/* Win Modal */}
      {showWinModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.winModal}>
            <p className={styles.modalEmoji}>🎉</p>
            <h2 className={styles.modalTitle}>You Won!</h2>
            <p className={styles.modalSubtitle}>Drago reached safety!</p>
            <p className={styles.modalScore}>Final Score: {score}</p>
            <button onClick={playAgain} className={styles.playAgainBtn}>
              Play Again
            </button>
          </div>
        </div>
      )}

      {/* Lose Modal */}
      {showLoseModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.loseModal}>
            <p className={styles.modalEmoji}>😢</p>
            <h2 className={styles.modalTitle}>Game Over!</h2>
            <p className={styles.modalSubtitle}>
              Drago couldn't escape in time
            </p>
            <p className={styles.modalScore}>Final Score: {score}</p>
            <button onClick={playAgain} className={styles.playAgainBtn}>
              Try Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default VolcanoWords;
