import React, { useState, useEffect, useMemo, useRef } from "react";
import styles from "../styles/VolcanoWords.module.css";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { gameProgressAPI } from "../server/endpoints";
import { getAuthUser } from "../server/auth";

import reading from "../assets/emotions/drago(reading).svg";
import sitting from "../assets/poses/drago(sitting).svg";
import { WinModal, LoseModal } from "../components/WinLose.jsx";

const API_BASE = "/api/volcano";

const INITIAL_LAVA_LEVEL = 40;
const INITIAL_HINTS = 5;

// Recording settings
const API_TIMEOUT_MS = 30000; // 30 second timeout for API calls

const defaultProgress = {
  unlockedLevel: 1,
  completedStages: {
    1: [false, false, false, false, false],
    2: [false, false, false, false, false],
    3: [false, false, false, false, false],
    4: [false, false, false, false, false],
    5: [false, false, false, false, false],
    6: [false, false, false, false, false],
  },
  stars: {
    1: [0, 0, 0, 0, 0],
    2: [0, 0, 0, 0, 0],
    3: [0, 0, 0, 0, 0],
    4: [0, 0, 0, 0, 0],
    5: [0, 0, 0, 0, 0],
    6: [0, 0, 0, 0, 0],
  },
};

const LEVEL_METADATA_EN = {
  1: {
    name: "Level 1: Short Vowels",
    focus: "Three-letter words with short vowels",
  },
  2: {
    name: "Level 2: Long Vowels (Mudood)",
    focus: "Alif, Waw, and Yaa",
  },
  3: {
    name: "Level 3: Sukoon & Tanween",
    focus: "Double vowels and silent marks",
  },
  4: {
    name: "Level 4: Shaddah & Ta Marbutah",
    focus: "Doubled sounds & feminine endings",
  },
  5: {
    name: "Level 5: Solar & Lunar Articles",
    focus: "Definite articles (Al-)",
  },
  6: {
    name: "Level 6: Simple Sentences",
    focus: "Simple sentences & reading fluency",
  },
};

const LEVEL_METADATA_AR = {
  1: {
    name: "المستوى 1: الحركات القصيرة",
    focus: "الكلمات الثلاثية بالحركات القصيرة",
  },
  2: {
    name: "المستوى 2: المدود الطويلة",
    focus: "الألف والواو والياء",
  },
  3: {
    name: "المستوى 3: المقطع الساكن والتنوين",
    focus: "الساكن والتنوين بالضم والفتح والكسر",
  },
  4: {
    name: "المستوى 4: الشدة والتاء المربوطة",
    focus: "الحروف المشددة والتاء المربوطة",
  },
  5: {
    name: "المستوى 5: اللام الشمسية والقمرية",
    focus: "ال التعريف الشمسية والقمرية",
  },
  6: {
    name: "المستوى 6: الجمل البسيطة",
    focus: "الجمل البسيطة والطلاقة القرائية",
  },
};

// ─── Pretest Welcome Modal ─────────────────────────────────────
const PretestWelcomeModal = ({ unlockedLevel, onDismiss }) => {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10000,
        direction: "rtl",
        padding: "20px",
      }}
    >
      <div
        style={{
          background: "linear-gradient(135deg, #2b1f0d, #1a1005)",
          border: "3px solid #ffd700",
          borderRadius: "24px",
          padding: "30px 24px",
          maxWidth: "480px",
          width: "100%",
          textAlign: "center",
          boxShadow:
            "0 10px 30px rgba(0,0,0,0.5), 0 0 20px rgba(212, 175, 55, 0.2)",
        }}
      >
        <div
          style={{
            fontSize: "70px",
            marginBottom: "15px",
            filter: "drop-shadow(0 0 10px #ffd700)",
          }}
        >
          🌟
        </div>
        <h2
          style={{
            color: "#ffd700",
            margin: "0 0 12px 0",
            fontSize: "24px",
            fontWeight: "bold",
          }}
        >
          مرحباً بك يا بطل!
        </h2>
        <p
          style={{
            color: "#fff",
            fontSize: "16px",
            lineHeight: "1.6",
            margin: "0 0 24px 0",
          }}
        >
          بناءً على أدائك الرائع في التقييم القَبلي، قمنا بفتح المستويات الأولى
          لتخطي المهارات التي تتقنها بالفعل.
          <br />
          <span
            style={{
              display: "block",
              marginTop: "10px",
              color: "#ffd700",
              fontWeight: "bold",
              fontSize: "18px",
            }}
          >
            رحلتك تبدأ مباشرة من المستوى {unlockedLevel}!
          </span>
        </p>
        <button
          onClick={onDismiss}
          style={{
            background: "linear-gradient(135deg, #ffd700, #b8860b)",
            border: "none",
            borderRadius: "14px",
            color: "#1a0f00",
            padding: "12px 32px",
            fontSize: "16px",
            fontWeight: "bold",
            cursor: "pointer",
            boxShadow: "0 4px 15px rgba(212,175,55,0.4)",
            transition: "transform 0.2s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.transform = "scale(1.05)")
          }
          onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}
        >
          ابدأ المغامرة الآن! 🚀
        </button>
      </div>
    </div>
  );
};

const reconstructDetailedProgress = (
  bgProgress,
  totalLevels = 6,
  stagesPerLevel = 5,
) => {
  const levelReached = bgProgress?.levelReached || 1;
  const completedStagesCount = bgProgress?.completedStages || 0;
  const starsEarned = bgProgress?.starsEarned || 0;

  const completedStages = {};
  const stars = {};

  let stagesRemaining = completedStagesCount;
  let starsRemaining = starsEarned;

  for (let l = 1; l <= totalLevels; l++) {
    completedStages[l.toString()] = [];
    stars[l.toString()] = [];

    for (let s = 0; s < stagesPerLevel; s++) {
      if (stagesRemaining > 0) {
        completedStages[l.toString()].push(true);
        stagesRemaining--;

        const allocated = Math.min(
          3,
          Math.max(1, starsRemaining - stagesRemaining),
        );
        stars[l.toString()].push(allocated);
        starsRemaining -= allocated;
      } else {
        completedStages[l.toString()].push(false);
        stars[l.toString()].push(0);
      }
    }
  }

  return {
    unlockedLevel: levelReached,
    completedStages,
    stars,
  };
};

function VolcanoWords() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  // Levels & Progress States
  const [levels, setLevels] = useState(null);
  const [levelId, setLevelId] = useState("1");
  const [view, setView] = useState("levels"); // 'levels', 'stages', 'game'
  const [selectedLevelId, setSelectedLevelId] = useState(null);
  const [selectedStageIndex, setSelectedStageIndex] = useState(null);
  const [progress, setProgress] = useState(() => {
    try {
      const stored = localStorage.getItem("volcano_words_progress");
      if (stored) {
        const parsed = JSON.parse(stored);
        const newProgress = { ...defaultProgress, ...parsed };
        newProgress.completedStages = {
          ...defaultProgress.completedStages,
          ...parsed.completedStages,
        };
        newProgress.stars = { ...defaultProgress.stars, ...parsed.stars };
        return newProgress;
      }
    } catch (e) {
      console.error("Failed to parse progress", e);
    }
    return defaultProgress;
  });

  const [showPretestModal, setShowPretestModal] = useState(false);

  useEffect(() => {
    const fetchProgress = async () => {
      const authUser = getAuthUser();
      const userId = authUser?.userId;
      if (!userId) return;

      try {
        const res = await gameProgressAPI.getByUser(userId);
        const progressList = res.data?.data || res.data;
        const bgProgress = Array.isArray(progressList)
          ? progressList.find((p) => p.gameKey === "volcano_words")
          : null;

        if (bgProgress) {
          const reconstructed = reconstructDetailedProgress(bgProgress, 6, 5);
          setProgress(reconstructed);
          localStorage.setItem(
            "volcano_words_progress",
            JSON.stringify(reconstructed),
          );
        }
      } catch (err) {
        console.error(
          "Failed to fetch backend progress for volcano_words:",
          err,
        );
      }
    };

    fetchProgress();
  }, []);

  useEffect(() => {
    if (progress?.showPretestWelcome && progress?.unlockedLevel > 1) {
      setShowPretestModal(true);
    }
  }, [progress]);

  const dismissPretestModal = () => {
    setShowPretestModal(false);
    setProgress((prev) => {
      const updated = { ...prev, showPretestWelcome: false };
      localStorage.setItem("volcano_words_progress", JSON.stringify(updated));
      return updated;
    });
  };

  const [words, setWords] = useState([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  // Game
  const [lavaLevel, setLavaLevel] = useState(INITIAL_LAVA_LEVEL);
  const [hints, setHints] = useState(INITIAL_HINTS);
  const [score, setScore] = useState(0);
  const [gameStatus, setGameStatus] = useState("playing");

  // Speech / feedback
  const [isRecording, setIsRecording] = useState(false);
  const [phase, setPhase] = useState("idle");
  const [transcript, setTranscript] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [showFeedbackIndicator, setShowFeedbackIndicator] = useState(false);

  // Endpoint outputs
  const [diffHtml, setDiffHtml] = useState("");
  const [similarity, setSimilarity] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [counts, setCounts] = useState(null);
  const [lastError, setLastError] = useState("");

  // Dragon pose
  const [dragoPose, setDragoPose] = useState(reading);

  const isGameOver = gameStatus !== "playing";
  const activeWord = words[currentWordIndex] || "";
  const numWords = words.length;

  // Recorder refs
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const stopTimerRef = useRef(null);

  // Load levels
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/get_levels`);
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        setLevels(data);

        const first = data["1"] ? "1" : Object.keys(data)[0];
        setLevelId(first);
      } catch (e) {
        console.error(e);
        setLastError(t("volcanoWords.errors.loadLevelsFailed"));
        alert(t("volcanoWords.errors.loadLevelsFailed"));
      }
    })();
  }, [t]);

  // Pose based on recording
  useEffect(() => {
    setDragoPose(isRecording ? sitting : reading);
  }, [isRecording]);

  // Lava bubbles
  const lavaBubbles = useMemo(
    () =>
      [...Array(8)].map((_, i) => ({
        key: i,
        width: `${15 + Math.random() * 20}px`,
        height: `${15 + Math.random() * 20}px`,
        left: `${10 + i * 12}%`,
        bottom: `${Math.random() * 30}px`,
        animationDelay: `${i * 0.4}s`,
        animationDuration: `${2 + Math.random() * 2}s`,
      })),
    [],
  );

  // Helpers
  function shuffle(arr) {
    return [...arr].sort(() => 0.5 - Math.random());
  }

  function resetPerWordUI() {
    setTranscript("");
    setDiffHtml("");
    setAnalysis(null);
    setSimilarity(null);
    setCounts(null);
    setFeedback(null);
    setShowFeedbackIndicator(false);
    setLastError("");
    setPhase("idle");
  }

  const handleSelectLevel = (levelId) => {
    const levelNum = parseInt(levelId, 10);
    if (levelNum > progress.unlockedLevel) return;
    setSelectedLevelId(levelId);
    setView("stages");
  };

  const handleSelectStage = (stageIndex) => {
    const isStageUnlocked = (stageIdx) =>
      stageIdx === 0 ||
      parseInt(selectedLevelId, 10) < progress.unlockedLevel ||
      progress.completedStages[selectedLevelId]?.[stageIdx - 1];
    if (!isStageUnlocked(stageIndex)) return;

    setSelectedStageIndex(stageIndex);

    const levelData = levels[selectedLevelId];
    if (!levelData || !levelData.content) return;

    const totalWords = levelData.content;
    const numStages = 5;
    const stageSize = Math.ceil(totalWords.length / numStages);

    let stageWords = totalWords.slice(
      stageIndex * stageSize,
      (stageIndex + 1) * stageSize,
    );
    if (stageWords.length === 0) {
      stageWords = totalWords.slice(0, 5);
    }

    setLevelId(selectedLevelId);
    setWords(shuffle(stageWords));
    setCurrentWordIndex(0);

    setLavaLevel(INITIAL_LAVA_LEVEL);
    setHints(INITIAL_HINTS);
    setScore(0);
    setGameStatus("playing");
    resetPerWordUI();
    setView("game");
  };

  const handleStageCompleted = (finalLavaLevel) => {
    let earnedStars = 1;
    if (finalLavaLevel <= 40) {
      earnedStars = 3;
    } else if (finalLavaLevel <= 75) {
      earnedStars = 2;
    }

    setProgress((prev) => {
      const completedStages = { ...prev.completedStages };
      const stars = { ...prev.stars };

      const currentLevelStages = [
        ...(completedStages[selectedLevelId] || [
          false,
          false,
          false,
          false,
          false,
        ]),
      ];
      currentLevelStages[selectedStageIndex] = true;
      completedStages[selectedLevelId] = currentLevelStages;

      const currentLevelStars = [
        ...(stars[selectedLevelId] || [0, 0, 0, 0, 0]),
      ];
      currentLevelStars[selectedStageIndex] = Math.max(
        currentLevelStars[selectedStageIndex] || 0,
        earnedStars,
      );
      stars[selectedLevelId] = currentLevelStars;

      // Check if all 5 stages of the current level are completed
      const allCompleted = currentLevelStages.every(Boolean);
      let unlockedLevel = prev.unlockedLevel;
      if (allCompleted) {
        unlockedLevel = Math.min(
          6,
          Math.max(unlockedLevel, parseInt(selectedLevelId, 10) + 1),
        );
      }

      const updatedProgress = {
        ...prev,
        unlockedLevel,
        completedStages,
        stars,
      };

      localStorage.setItem(
        "volcano_words_progress",
        JSON.stringify(updatedProgress),
      );

      // Synchronize with backend
      let totalCompletedStages = 0;
      Object.keys(completedStages).forEach((level) => {
        totalCompletedStages += completedStages[level].filter(Boolean).length;
      });

      let totalStars = 0;
      Object.keys(stars).forEach((level) => {
        totalStars += stars[level].reduce((sum, s) => sum + s, 0);
      });

      const maxStages = 6 * 5;
      const completionPercent = Math.min(
        100,
        Math.round((totalCompletedStages / maxStages) * 100),
      );

      const authUser = getAuthUser();
      const userId = authUser?.userId;
      if (userId) {
        // Record this specific stage completion
        gameProgressAPI
          .completeStage(userId, {
            gameKey: "volcano_words",
            stageNumber: selectedStageIndex + 1,
            score: score,
            starsEarned: earnedStars,
          })
          .catch((err) => {
            console.error("Failed to complete stage on backend:", err);
          });

        // Update aggregate progress
        gameProgressAPI
          .update(userId, {
            gameKey: "volcano_words",
            levelReached: unlockedLevel,
            completedStages: totalCompletedStages,
            starsEarned: totalStars,
            completionPercent,
          })
          .catch((err) => {
            console.error("Failed to update backend progress:", err);
          });
      }

      return updatedProgress;
    });
  };

  function renderMistakes(analysisJson) {
    if (!analysisJson?.mistakes?.length) {
      return (
        <div
          style={{
            marginTop: 12,
            fontSize: 14,
            color: "#2e7d32",
            fontWeight: 700,
          }}
        >
          {t("volcanoWords.feedback.noMistakes")}
        </div>
      );
    }

    return (
      <div
        style={{
          marginTop: 12,
          textAlign: "left",
          fontSize: 14,
          lineHeight: 1.6,
        }}
      >
        <div style={{ fontWeight: 800, marginBottom: 6 }}>
          {t("volcanoWords.mistakes.title")}
        </div>

        {analysisJson.mistakes.map((m, idx) => {
          if (m.type === "missing") {
            return (
              <div key={idx} style={{ color: "#e53935" }}>
                • {t("volcanoWords.mistakes.missing")}: <b>{m.expected}</b>
              </div>
            );
          }

          if (m.type === "extra") {
            return (
              <div key={idx} style={{ color: "#fb8c00" }}>
                • {t("volcanoWords.mistakes.extra")}: <b>{m.spoken}</b>
              </div>
            );
          }

          if (m.type === "substitute") {
            const edits = m?.char_detail?.char_edits || [];
            return (
              <div key={idx} style={{ color: "#e53935" }}>
                • {t("volcanoWords.mistakes.substitute")} <b>{m.spoken}</b>{" "}
                {t("volcanoWords.mistakes.insteadOf")} <b>{m.expected}</b>
                {edits.length > 0 && (
                  <div style={{ marginLeft: 10, marginTop: 4, color: "#444" }}>
                    {t("volcanoWords.mistakes.letters")}
                    {edits.slice(0, 8).map((e, i) => (
                      <span key={i} style={{ marginLeft: 8 }}>
                        {e.type === "substitute_char" && (
                          <>
                            {" "}
                            {e.expected_char} → {e.spoken_char}{" "}
                          </>
                        )}
                        {e.type === "missing_char" && (
                          <>
                            {" "}
                            {t("volcanoWords.mistakes.missingChar")} "
                            {e.expected_char}"{" "}
                          </>
                        )}
                        {e.type === "extra_char" && (
                          <>
                            {" "}
                            {t("volcanoWords.mistakes.extraChar")} "
                            {e.spoken_char}"{" "}
                          </>
                        )}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return null;
        })}
      </div>
    );
  }

  // Game logic
  const handleCorrectAnswer = () => {
    setFeedback("correct");
    setShowFeedbackIndicator(true);
    setScore((prev) => prev + 10);
    setLavaLevel((prev) => Math.max(0, prev - 10));

    setTimeout(() => {
      setShowFeedbackIndicator(false);
    }, 1200);
  };

  const handleNextWord = () => {
    if (currentWordIndex < words.length - 1) {
      setCurrentWordIndex((prev) => prev + 1);
      resetPerWordUI();
    } else {
      setGameStatus("won");
      handleStageCompleted(lavaLevel);
    }
  };

  const handleWrongAnswer = () => {
    setFeedback("wrong");
    setShowFeedbackIndicator(true);

    setLavaLevel((prev) => {
      const newLevel = Math.min(100, prev + 15);
      if (newLevel >= 100) setGameStatus("lost");
      return newLevel;
    });

    setTimeout(() => {
      setShowFeedbackIndicator(false);
      setFeedback(null);
    }, 1200);
  };

  const handleSkipWord = () => {
    if (isGameOver) return;

    if (currentWordIndex < words.length - 1) {
      setCurrentWordIndex((prev) => prev + 1);
      resetPerWordUI();
    } else {
      const finalStatus = score > (words.length / 2) * 10 ? "won" : "lost";
      setGameStatus(finalStatus);
      if (finalStatus === "won") {
        handleStageCompleted(lavaLevel);
      }
    }
  };

  const restartGame = () => {
    if (gameStatus === "won") {
      setView("stages");
      setGameStatus("playing");
      resetPerWordUI();
    } else {
      handleSelectStage(selectedStageIndex);
    }
  };

  // TTS Hint
  const handleUseHint = async () => {
    if (hints <= 0 || isRecording || isGameOver || !activeWord) return;
    setHints((prev) => prev - 1);

    try {
      const audio = new Audio(
        `${API_BASE}/tts?word=${encodeURIComponent(activeWord)}&t=${Date.now()}`,
      );
      await audio.play();
    } catch (e) {
      console.error(e);
      setLastError(t("volcanoWords.errors.ttsFailed"));
    }
  };

  // Recording + API with timeout
  const handleStartRecording = async () => {
    if (isGameOver) return;

    // Manual STOP
    if (isRecording && recorderRef.current?.state === "recording") {
      try {
        clearTimeout(stopTimerRef.current);
        recorderRef.current.stop();
        setPhase("uploading"); // optional: show uploading while stopping
      } catch (e) {
        console.error("Error stopping recorder:", e);
      }
      return;
    }

    // Manual START
    resetPerWordUI();
    setIsRecording(true);
    setPhase("recording");

    try {
      await startRecording(activeWord);
    } catch (e) {
      console.error(e);
      setIsRecording(false);
      setPhase("idle");
      setLastError(t("volcanoWords.errors.recordingFailed"));
    }
  };

  async function startRecording(wordAtStart) {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });

    const recorder = new MediaRecorder(stream); // let browser choose best
    recorderRef.current = recorder;
    chunksRef.current = [];

    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onerror = (e) => {
      console.error("Recorder error:", e);
      stream.getTracks().forEach((t) => t.stop());
      setIsRecording(false);
      setPhase("idle");
      setLastError(t("volcanoWords.errors.recordingFailed"));
    };

    recorder.onstop = async () => {
      try {
        clearTimeout(stopTimerRef.current);

        stream.getTracks().forEach((tr) => tr.stop());

        const blob = new Blob(chunksRef.current, { type: "audio/webm" });

        setIsRecording(false);

        if (blob.size < 5000) {
          setPhase("idle");
          setLastError(t("volcanoWords.errors.audioNotClear"));
          handleWrongAnswer();
          return;
        }

        setPhase("uploading");

        const check = await callCheckWordWithTimeout(blob, wordAtStart);

        if (!check || typeof check.status !== "string") {
          setPhase("idle");
          setLastError(t("volcanoWords.errors.checkWordError"));
          return;
        }

        if (check.status === "retry") {
          setPhase("idle");
          setLastError(check.message || t("volcanoWords.errors.audioNotClear"));
          handleWrongAnswer();
          return;
        }

        if (check.status === "error") {
          setPhase("idle");
          setLastError(
            check.message || t("volcanoWords.errors.checkWordError"),
          );
          return;
        }

        if (check.status !== "success") {
          setPhase("idle");
          setLastError(check.message || "Unexpected server response");
          return;
        }

        const recognizedText = check.recognized ?? check.spoken_text ?? "";
        setTranscript(recognizedText);

        setDiffHtml(check.diff_html || "");
        setSimilarity(check.similarity ?? null);

        setAnalysis(check.analysis || null);
        setCounts(check.counts || null);

        setPhase("idle");

        if (check.passed) handleCorrectAnswer();
        else handleWrongAnswer();
      } catch (e) {
        console.error(e);
        setIsRecording(false);
        setPhase("idle");
        setLastError(t("volcanoWords.errors.connectionError"));
      }
    };

    recorder.start(); // manual stop

    // ✅ Fix "speak immediately": request an early chunk
    setTimeout(() => {
      try {
        recorder.requestData();
      } catch {
        console.log();
      }
    }, 150);

    // OPTIONAL safety max: auto-stop after 15s if user forgets
    stopTimerRef.current = setTimeout(() => {
      if (recorderRef.current?.state === "recording") {
        try {
          recorderRef.current.stop();
        } catch {
          console.log();
        }
      }
    }, 15000);
  }

  // Helper: fetch with timeout
  async function fetchWithTimeout(url, options, timeout = API_TIMEOUT_MS) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(id);
      return response;
    } catch (error) {
      clearTimeout(id);
      if (error.name === "AbortError") {
        throw new Error("Request timeout - الطلب استغرق وقتاً طويلاً");
      }
      throw error;
    }
  }

  async function callCheckWordWithTimeout(audioBlob, targetWord) {
    const form = new FormData();
    form.append("file", audioBlob, "speech.webm");
    form.append("target_word", targetWord);

    try {
      const res = await fetchWithTimeout(`${API_BASE}/check_word`, {
        method: "POST",
        body: form,
      });

      if (!res.ok) return { status: "error", message: await res.text() };
      return await res.json();
    } catch (error) {
      console.error("Check word error:", error);
      return {
        status: "error",
        message: error.message || t("volcanoWords.errors.connectionError"),
      };
    }
  }

  // Render
  if (!levels) {
    return (
      <div
        className={styles.gameContainer}
        style={{
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <div style={{ color: "#fff", fontSize: 24, fontWeight: 700 }}>
          {t("volcanoWords.loading", "جاري تحميل المستويات...")}
        </div>
      </div>
    );
  }

  // Level Selection view
  if (view === "levels") {
    return (
      <div className={styles.gameContainer}>
        {showPretestModal && (
          <PretestWelcomeModal
            unlockedLevel={progress.unlockedLevel}
            onDismiss={dismissPretestModal}
          />
        )}
        <nav className={styles.headerNav}>
          <button className={styles.exitBtn} onClick={() => navigate("/home")}>
            {t("volcanoWords.exit", "خروج")}
          </button>
          <div className={styles.scoreBoard}>
            {t("volcanoWords.mapTitle", "خريطة المغامرة")}
          </div>
        </nav>

        <div className={styles.selectionContainer}>
          <div className={styles.mapTitleContainer}>
            <h1 className={styles.mapTitle}>
              {t("volcanoWords.mapTitle", "خريطة المغامرة")}
            </h1>
            <p className={styles.mapSubtitle}>
              {t("volcanoWords.mapSubtitle", "اختر مستوى لتبدأ مغامرة دراغو!")}
            </p>
          </div>

          <div className={styles.levelsGrid}>
            {Object.keys(defaultProgress.completedStages).map((id) => {
              const levelNum = parseInt(id, 10);
              const isUnlocked = levelNum <= progress.unlockedLevel;
              const levelMeta = i18n.language?.startsWith("en")
                ? LEVEL_METADATA_EN[id]
                : LEVEL_METADATA_AR[id];
              const levelName =
                levels?.[id]?.name || levelMeta?.name || `Level ${id}`;
              const levelFocus = levelMeta?.focus || levels?.[id]?.focus || "";

              const completedCount =
                progress.completedStages[id]?.filter(Boolean).length || 0;
              const progressPercent = (completedCount / 5) * 100;
              const isRecommended = levelNum === progress.recommendedLevel;

              return (
                <div
                  key={id}
                  className={`${styles.levelCard} ${!isUnlocked ? styles.levelCardLocked : ""}`}
                  style={{
                    position: "relative",
                    ...(isRecommended
                      ? {
                          border: "3px solid #ffd700",
                          boxShadow:
                            "0 0 20px #ffd700, inset 0 0 10px rgba(255, 215, 0, 0.2)",
                        }
                      : {}),
                  }}
                  onClick={() => isUnlocked && handleSelectLevel(id)}
                >
                  {!isUnlocked && <div className={styles.lockOverlay}>🔒</div>}
                  {isRecommended && (
                    <div
                      style={{
                        position: "absolute",
                        top: "10px",
                        left: "10px",
                        background: "linear-gradient(135deg, #ffd700, #b8860b)",
                        color: "#1a0f00",
                        padding: "4px 10px",
                        borderRadius: "12px",
                        fontSize: "11px",
                        fontWeight: "bold",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                        zIndex: 2,
                      }}
                    >
                      المستوى الموصى به ⭐
                    </div>
                  )}
                  <div className={styles.levelCardContent}>
                    <span className={styles.levelNum}>
                      {t("volcanoWords.level", "المستوى")} {id}
                    </span>
                    <h3 className={styles.levelName}>{levelName}</h3>
                    <p className={styles.levelFocus}>{levelFocus}</p>
                  </div>

                  <div className={styles.levelFooter}>
                    <div className={styles.levelProgressText}>
                      <span>{completedCount}/5</span>
                      <span>
                        {t("volcanoWords.progressLabel", "المراحل المكتملة")}
                      </span>
                    </div>
                    <div className={styles.progressBarBg}>
                      <div
                        className={styles.progressBarFill}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Stage Selection view
  if (view === "stages") {
    const levelMeta = i18n.language?.startsWith("en")
      ? LEVEL_METADATA_EN[selectedLevelId]
      : LEVEL_METADATA_AR[selectedLevelId];
    const levelName =
      levels?.[selectedLevelId]?.name ||
      levelMeta?.name ||
      `Level ${selectedLevelId}`;

    return (
      <div className={styles.gameContainer}>
        <nav className={styles.headerNav}>
          <button className={styles.exitBtn} onClick={() => setView("levels")}>
            {t("volcanoWords.back", "رجوع")}
          </button>
          <div className={styles.scoreBoard}>{levelName}</div>
        </nav>

        <div className={styles.selectionContainer}>
          <div className={styles.stagesContainer}>
            <div className={styles.stagesHeader}>
              <button
                className={styles.backBtn}
                onClick={() => setView("levels")}
              >
                {t("volcanoWords.backToLevels", "◀ العودة للمستويات")}
              </button>
              <h2 className={styles.stagesHeaderTitle}>{levelName}</h2>
            </div>

            <div className={styles.stagesGrid}>
              {[...Array(5)].map((_, stageIdx) => {
                const isStageUnlocked =
                  stageIdx === 0 ||
                  parseInt(selectedLevelId, 10) < progress.unlockedLevel ||
                  progress.completedStages[selectedLevelId]?.[stageIdx - 1];
                const earnedStars =
                  progress.stars[selectedLevelId]?.[stageIdx] || 0;
                const isRecommended =
                  parseInt(selectedLevelId, 10) === progress.recommendedLevel &&
                  stageIdx === (progress.recommendedStage - 1 || 0);

                return (
                  <div
                    key={stageIdx}
                    className={styles.stageNodeWrapper}
                    style={{ position: "relative" }}
                  >
                    {isRecommended && (
                      <div
                        style={{
                          position: "absolute",
                          top: "-22px",
                          left: "50%",
                          transform: "translateX(-50%)",
                          background:
                            "linear-gradient(135deg, #ffd700, #b8860b)",
                          color: "#1a0f00",
                          padding: "2px 8px",
                          borderRadius: "10px",
                          fontSize: "10px",
                          fontWeight: "bold",
                          whiteSpace: "nowrap",
                          boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
                          zIndex: 2,
                        }}
                      >
                        بداية المسار 🚀
                      </div>
                    )}
                    <div
                      className={`${styles.stageNode} ${!isStageUnlocked ? styles.stageNodeLocked : ""}`}
                      style={
                        isRecommended
                          ? {
                              boxShadow: "0 0 15px #ffd700, 0 0 5px #ffd700",
                              border: "3px solid #ffd700",
                            }
                          : {}
                      }
                      onClick={() =>
                        isStageUnlocked && handleSelectStage(stageIdx)
                      }
                    >
                      {isStageUnlocked ? stageIdx + 1 : "🔒"}
                    </div>
                    <div className={styles.stageLabel}>
                      {t("volcanoWords.stageLabel", "المرحلة")} {stageIdx + 1}
                    </div>
                    <div className={styles.stageStars}>
                      {[...Array(3)].map((_, starIdx) => {
                        const isActive = starIdx < earnedStars;
                        return (
                          <span
                            key={starIdx}
                            className={`${styles.star} ${isActive ? styles.starActive : styles.starInactive}`}
                          >
                            ★
                          </span>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Active Game View
  const levelMeta = i18n.language?.startsWith("en")
    ? LEVEL_METADATA_EN[levelId]
    : LEVEL_METADATA_AR[levelId];
  const levelName =
    levels?.[levelId]?.name || levelMeta?.name || `Level ${levelId}`;

  return (
    <div className={styles.gameContainer}>
      <nav className={styles.headerNav}>
        <button className={styles.exitBtn} onClick={() => setView("stages")}>
          {t("volcanoWords.back", "رجوع")}
        </button>

        <div className={styles.heartsContainer}>
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

        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            color: "#fff",
            fontWeight: 700,
          }}
        >
          <span>{levelName}</span>
          <span>•</span>
          <span>
            {t("volcanoWords.stageLabel", "المرحلة")} {selectedStageIndex + 1}
          </span>
        </div>

        <div className={styles.scoreBoard}>
          {t("volcanoWords.score")}: {score}
        </div>
      </nav>

      <div className={styles.gameContent}>
        <WordPanal
          word={activeWord}
          isRecording={isRecording}
          phase={phase}
          transcript={transcript}
          feedback={feedback}
          hints={hints}
          wordIndex={currentWordIndex}
          numWords={numWords}
          handleStartRecording={handleStartRecording}
          handleUseHint={handleUseHint}
          handleSkipWord={handleSkipWord}
          handleNextWord={handleNextWord}
          isGameOver={isGameOver}
          diffHtml={diffHtml}
          counts={counts}
          lastError={lastError}
          similarity={similarity}
          analysis={analysis}
          renderMistakes={renderMistakes}
        />

        <div className={styles.dragonContainer}>
          <img src={dragoPose} alt="Drago" className={styles.dragonImage} />
        </div>

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
          {t("volcanoWords.winMessage")}
        </WinModal>
      ) : gameStatus === "lost" ? (
        <LoseModal score={score} restartGame={restartGame}>
          {t("volcanoWords.loseMessage")}
        </LoseModal>
      ) : null}
    </div>
  );
}

// Sub-Components

function VolcanoPanel({
  lavaLevel,
  lavaBubbles,
  feedback,
  showFeedbackIndicator,
  dragoPose,
}) {
  return (
    <div className={styles.volcanoPanel}>
      <div style={{ position: "relative" }}>
        <img src={dragoPose} alt="Drago" className={styles.dragonImageMobile} />
        <div className={styles.volcanoContainer}>
          <div className={styles.volcanoTop}></div>

          <div className={styles.lavaContainer}>
            <div
              className={styles.lavaLevel}
              style={{ height: `${lavaLevel}%` }}
            >
              <div className={styles.lavaSurface}></div>
              {lavaBubbles.map((bubble) => (
                <div
                  key={bubble.key}
                  className={styles.lavaBubble}
                  style={bubble}
                />
              ))}
            </div>
          </div>

          {showFeedbackIndicator && (
            <div className={`${styles.feedbackIndicator} ${styles[feedback]}`}>
              {feedback === "correct" ? "✓ +10" : "✗ +15% Lava"}
            </div>
          )}
        </div>

        <div className={styles.percentageMarkers}>
          <div
            className={`${styles.marker} ${lavaLevel >= 100 ? styles.critical : ""}`}
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
  phase,
  transcript,
  feedback,
  hints,
  wordIndex,
  numWords,
  handleStartRecording,
  handleUseHint,
  handleSkipWord,
  handleNextWord,
  isGameOver,
  diffHtml,
  counts,
  lastError,
  analysis,
  renderMistakes,
  similarity,
}) {
  const isArabic = /[\u0600-\u06FF]/.test(word || "");
  const { t } = useTranslation();

  return (
    <div className={styles.wordPanel}>
      <div className={styles.wordCard}>
        {/* <img src={dragoPose} alt="Drago" className={styles.dragonImageMobile} /> */}
        <div
          className={styles.wordDisplay}
          style={{ direction: isArabic ? "rtl" : "ltr" }}
        >
          {word || "..."}
        </div>

        {phase !== "idle" && (
          <div style={{ marginTop: 10, fontSize: 14, fontWeight: 800 }}>
            {phase === "recording" && t("volcanoWords.phases.recording")}
            {phase === "uploading" && t("volcanoWords.phases.uploading")}
            {phase === "processing" && t("volcanoWords.phases.processing")}
          </div>
        )}

        {feedback && (
          <div
            className={`${styles.feedbackMessage} ${
              feedback === "correct"
                ? styles.feedbackCorrect
                : styles.feedbackWrong
            }`}
          >
            {feedback === "correct"
              ? t("volcanoWords.feedback.correct")
              : t("volcanoWords.feedback.wrong")}
          </div>
        )}

        {isRecording && (
          <div className={styles.feedbackMessage}>
            {t("volcanoWords.phases.listening")}
          </div>
        )}

        {transcript && (
          <div
            className={styles.transcriptText}
            style={{ direction: isArabic ? "rtl" : "ltr" }}
          >
            {t("volcanoWords.feedback.youSaid")}: "<strong>{transcript}</strong>
            "
          </div>
        )}

        {similarity !== null && (
          <div style={{ marginTop: 6, fontSize: 12, opacity: 0.75 }}>
            Similarity: {Math.round(similarity)}%
          </div>
        )}

        {diffHtml && (
          <div
            style={{
              marginTop: 10,
              fontSize: 16,
              direction: "rtl",
              lineHeight: 1.7,
            }}
            dangerouslySetInnerHTML={{ __html: diffHtml }}
          />
        )}

        {analysis && renderMistakes(analysis)}

        {counts && (
          <div style={{ marginTop: 10, fontSize: 13, opacity: 0.9 }}>
            الأخطاء: ناقص {counts.missing_words}, زائد {counts.extra_words},
            مستبدل {counts.substitute_words}
          </div>
        )}

        {lastError && (
          <div
            style={{
              marginTop: 10,
              fontSize: 12,
              color: "#f44336",
              fontWeight: 600,
            }}
          >
            {lastError}
          </div>
        )}

        <div className={styles.wordCounter}>
          {t("volcanoWords.word")} {Math.min(wordIndex + 1, numWords || 1)}{" "}
          {t("volcanoWords.of")} {numWords || 1}
        </div>
      </div>

      <div className={styles.actionButtons}>
        {feedback === "correct" ? (
          <ActionBtn icon="➡️" primary onClick={handleNextWord} />
        ) : (
          <>
            <ActionBtn
              icon={isRecording ? "🛑" : "🎤"}
              primary
              disabled={isGameOver || (!isRecording && phase !== "idle")}
              onClick={handleStartRecording}
            />
            <ActionBtn
              icon="💡"
              disabled={hints <= 0 || isRecording || isGameOver}
              onClick={handleUseHint}
            />
            <ActionBtn
              icon="➡️"
              disabled={isRecording || isGameOver}
              onClick={handleSkipWord}
            />
          </>
        )}
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
