// src/games/ReadingQuest.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/ReadingQuest.module.css";
import { WinModal, LoseModal } from "../components/WinLose";
import { BoatSVG, TornadoSVG } from "../components/GameIcons";
import { shalalAPI, profileAPI, gameProgressAPI } from "../server/endpoints";
import { recordXpAttempt } from "../utils/xpDebug";
import { getAuthUser, getProgressStorageKey } from "../server/auth";
import { SHALAL_DATA } from "../data/shalal_stories";
import { useTranslation } from "react-i18next";

const defaultProgress = {
  unlockedLevel: 1,
  completedStages: {
    1: [false, false, false, false, false],
    2: [false, false, false, false, false],
    3: [false, false, false, false, false],
    4: [false, false, false, false, false],
  },
  stars: {
    1: [0, 0, 0, 0, 0],
    2: [0, 0, 0, 0, 0],
    3: [0, 0, 0, 0, 0],
    4: [0, 0, 0, 0, 0],
  },
};

const LEVEL_METADATA_EN = {
  1: {
    name: "Level 1: Basics",
    focus: "Basic reading comprehension and short sentences",
  },
  2: {
    name: "Level 2: Daily Life",
    focus: "Reading about daily routines, school, and activities",
  },
  3: {
    name: "Level 3: Hobbies & Interests",
    focus: "Reading about sports, instruments, and creative pursuits",
  },
  4: {
    name: "Level 4: Science & Nature",
    focus: "Complex stories about ecosystems, space, and anatomy",
  },
};

const LEVEL_METADATA_AR = {
  1: {
    name: "المستوى 1: الأساسيات",
    focus: "فهم المقروء الأساسي والجمل البسيطة",
  },
  2: {
    name: "المستوى 2: الحياة اليومية",
    focus: "قراءة حول الروتين اليومي والمدرسة والأنشطة",
  },
  3: {
    name: "المستوى 3: الهوايات والاهتمامات",
    focus: "قراءة حول الرياضة والآلات الموسيقية والاهتمامات الإبداعية",
  },
  4: {
    name: "المستوى 4: العلوم والطبيعة",
    focus: "قصص علمية حول الأنظمة البيئية والفضاء والجسد",
  },
};

// ─── Pretest Welcome Modal ─────────────────────────────────────
function PretestWelcomeModal({ unlockedLevel, onDismiss }) {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.85)",
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
          background: "linear-gradient(135deg, #0a1f2b, #051015)",
          border: "3px solid #ffd700",
          borderRadius: "24px",
          padding: "30px 24px",
          maxWidth: "480px",
          width: "100%",
          textAlign: "center",
          boxShadow:
            "0 10px 30px rgba(0,0,0,0.6), 0 0 25px rgba(212, 175, 55, 0.3)",
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
          style={{ color: "#ffd700", margin: "0 0 12px 0", fontSize: "24px" }}
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
          بناءً على أدائك في التقييم القَبلي، قمنا بفتح المستويات الأولى لتخطي
          المهارات التي تتقنها.
          <span
            style={{
              display: "block",
              marginTop: "10px",
              color: "#ffd700",
              fontWeight: "bold",
              fontSize: "18px",
            }}
          >
            رحلتك تبدأ من المستوى {unlockedLevel}!
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
          ابدأ الرحلة الآن! 🚲
        </button>
      </div>
    </div>
  );
}

const reconstructDetailedProgress = (
  bgProgress,
  totalLevels = 4,
  stagesPerLevel = 5,
) => {
  const levelReached = bgProgress?.levelReached || 1;
  const completedStagesCount = bgProgress?.completedStages || 0;

  const completedStages = {};
  const stars = {};

  let stagesRemaining = completedStagesCount;
  for (let l = 1; l <= totalLevels; l++) {
    completedStages[l.toString()] = [];
    stars[l.toString()] = [];

    for (let s = 0; s < stagesPerLevel; s++) {
      if (stagesRemaining > 0) {
        completedStages[l.toString()].push(true);
        stagesRemaining--;
        stars[l.toString()].push(0);
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

function ReadingQuest() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  // ── Progress & Navigation State ───────────────────────────────────────────
  const [view, setView] = useState("levels"); // 'levels', 'stages', 'game'
  const [selectedLevelId, setSelectedLevelId] = useState(null);
  const [selectedStageIndex, setSelectedStageIndex] = useState(null);
  const [progress, setProgress] = useState(() => {
    try {
      const stored = localStorage.getItem(
        getProgressStorageKey("reading_quest_progress"),
      );
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

  const [showPretestModal, setShowPretestModal] = useState(() => {
    try {
      const stored = localStorage.getItem(
        getProgressStorageKey("reading_quest_progress"),
      );
      if (stored) {
        const p = JSON.parse(stored);
        return Boolean(p?.showPretestWelcome && p?.unlockedLevel > 1);
      }
    } catch (e) {
      console.error("Failed to parse progress for pretest modal", e);
    }
    return false;
  });

  const dismissPretestModal = () => {
    setShowPretestModal(false);
    setProgress((prev) => {
      const updated = { ...prev, showPretestWelcome: false };
      localStorage.setItem(
        getProgressStorageKey("reading_quest_progress"),
        JSON.stringify(updated),
      );
      return updated;
    });
  };

  // ── Game State ─────────────────────────────────────────────────────────────

  const [stageQuestions, setStageQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [sessionId, setSessionId] = useState(null);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  const [showQuestion, setShowQuestion] = useState(false);
  const [waterLevel, setWaterLevel] = useState(30);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [gameStatus, setGameStatus] = useState("playing");

  useEffect(() => {
    const fetchProgress = async () => {
      const userId = getUserId();
      if (!userId) return;

      setLoading(true);
      try {
        const res = await gameProgressAPI.getByUser(userId);
        const progressList = res.data?.data || res.data;
        const bgProgress = Array.isArray(progressList)
          ? progressList.find((p) => p.gameKey === "reading_quest")
          : null;

        if (bgProgress) {
          const reconstructed = reconstructDetailedProgress(bgProgress, 4, 5);
          setProgress(reconstructed);
          localStorage.setItem(
            getProgressStorageKey("reading_quest_progress"),
            JSON.stringify(reconstructed),
          );
        }
      } catch (err) {
        console.error("Failed to fetch backend progress:", err);
        setApiError(
          t(
            "readingQuest.errLoadingProgress",
            "Failed to sync progress with backend.",
          ),
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, []);

  // get userId from auth helper
  const getUserId = () => {
    const authUser = getAuthUser();
    return authUser?.userId || null;
  };

  // ── Level/Stage Selection Handlers ──────────────────────────────────────────
  const handleSelectLevel = (levelId) => {
    const levelNum = parseInt(levelId, 10);
    if (levelNum > progress.unlockedLevel) return;
    setSelectedLevelId(levelId);
    setView("stages");
  };

  const handleSelectStage = (stageIndex) => {
    const levelNum = parseInt(selectedLevelId, 10);
    const isStageUnlocked =
      stageIndex === 0 ||
      levelNum < progress.unlockedLevel ||
      progress.completedStages[selectedLevelId]?.[stageIndex - 1];
    if (!isStageUnlocked) return;

    setSelectedStageIndex(stageIndex);

    const levelData = SHALAL_DATA[parseInt(selectedLevelId, 10) - 1];
    if (!levelData || !levelData.questions) return;

    const totalQuestions = levelData.questions;
    const numStages = 5;
    const stageSize = Math.ceil(totalQuestions.length / numStages);

    let questions = totalQuestions.slice(
      stageIndex * stageSize,
      (stageIndex + 1) * stageSize,
    );
    if (questions.length === 0) {
      questions = totalQuestions.slice(0, 4);
    }

    setStageQuestions(questions);
    setCurrentQuestionIndex(0);
    setShowQuestion(false);

    setWaterLevel(30);
    setScore(0);
    setGameStatus("playing");
    setFeedback(null);
    setSessionId(null);
    setSessionStartTime(null);

    setView("game");
  };

  const handleStageCompleted = (finalWaterLevel) => {
    let earnedStars = 1;
    if (finalWaterLevel <= 15) {
      earnedStars = 3;
    } else if (finalWaterLevel <= 45) {
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
          4,
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
        getProgressStorageKey("reading_quest_progress"),
        JSON.stringify(updatedProgress),
      );

      // Synchronize with backend only for registered users.
      const userId = getUserId();
      if (userId) {
        gameProgressAPI
          .completeStage(userId, {
            gameKey: "reading_quest",
            levelNumber: parseInt(selectedLevelId, 10),
            stageNumber: selectedStageIndex + 1,
            score: score,
            starsEarned: earnedStars,
          })
          .catch((err) => {
            console.error("Failed to complete stage on backend:", err);
          });
      }

      return updatedProgress;
    });

    finishSession(true);
  };

  // ── Session Management ─────────────────────────────────────────────────────
  const startSession = async (levelNumber) => {
    const userId = getUserId();
    if (!userId) return;
    try {
      const res = await shalalAPI.startSession(userId, levelNumber);
      const session = res.data?.data ?? res.data;
      setSessionId(session?.id ?? null);
      setSessionStartTime(Date.now());
    } catch (e) {
      console.error("Failed to start session:", e);
    }
  };

  const recordAnswer = async (isCorrect) => {
    if (!sessionId) return;
    try {
      await shalalAPI.submitAnswer(sessionId, isCorrect);
    } catch (e) {
      console.error("Failed to record answer:", e);
    }
  };

  const finishSession = async (won = false) => {
    if (!sessionId) return;
    try {
      const timeSeconds = sessionStartTime
        ? Math.floor((Date.now() - sessionStartTime) / 1000)
        : 0;
      await shalalAPI.finishSession(sessionId, timeSeconds);

      // Award XP if game was won
      if (won) {
        const userId = getUserId();
        if (userId) {
          const xpEarned = Math.floor(score / 10) * 5; // 5 XP per level completed
          try {
            const res = await profileAPI.awardXP(userId, xpEarned, true);
            console.log("awardXP response (ReadingQuest):", res.data ?? res);
            try {
              recordXpAttempt(
                { userId, xp: xpEarned, sessionCompleted: true },
                res.data ?? res,
              );
            } catch (e) {
              console.warn("Failed to record XP attempt:", e);
            }
          } catch (xpErr) {
            console.warn("Could not award XP:", xpErr);
          }
        }
      }
    } catch (e) {
      console.error("Failed to finish session:", e);
    }
  };

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleNextClick = async () => {
    setShowQuestion(true);
    setFeedback(null);
    if (!sessionId) {
      await startSession(parseInt(selectedLevelId, 10));
    }
  };

  const handleOptionClick = async (selectedOption) => {
    if (feedback) return;

    const q = stageQuestions[currentQuestionIndex];
    const correctAnswer = q?.answer;
    const isCorrect =
      selectedOption === correctAnswer ||
      selectedOption?.toLowerCase() === correctAnswer?.toLowerCase();

    await recordAnswer(isCorrect);

    if (isCorrect) {
      setFeedback("correct");
      setScore((s) => s + 10);
      setWaterLevel((w) => Math.max(0, w - 10));
      playSound("correct");

      setTimeout(async () => {
        const nextQuestionIndex = currentQuestionIndex + 1;
        if (nextQuestionIndex < stageQuestions.length) {
          setCurrentQuestionIndex(nextQuestionIndex);
          setShowQuestion(false);
          setFeedback(null);
        } else {
          // Completed all questions in this stage!
          const finalWater = Math.max(0, waterLevel - 10);
          handleStageCompleted(finalWater);
          setGameStatus("won");
        }
      }, 1500);
    } else {
      setFeedback("wrong");
      playSound("wrong");
      setWaterLevel((w) => {
        const newLevel = Math.min(100, w + 25);
        if (newLevel >= 100) {
          finishSession(false).then(() => setGameStatus("lost"));
        }
        return newLevel;
      });
      setTimeout(() => setFeedback(null), 1500);
    }
  };

  const restartGame = async () => {
    if (gameStatus === "won") {
      setView("stages");
      setGameStatus("playing");
      setFeedback(null);
    } else {
      handleSelectStage(selectedStageIndex);
    }
  };

  // ── Helpers ──────────────────────────────────────────────────────────────────
  const playSound = (type) => {
    try {
      const sounds = {
        correct: "/sounds/correct.mp3",
        wrong: "/sounds/wrong.mp3",
      };
      if (sounds[type]) {
        const audio = new Audio(sounds[type]);
        audio.volume = 0.5;
        audio.play().catch(() => {});
      }
    } catch (e) {
      /* ignore */
      console.error("Failed to play sound", e);
    }
  };

  const speakText = (text) => {
    if (!text) return;
    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "ar-SA";
      utterance.rate = 0.85;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("TTS not supported", e);
    }
  };

  const isRTL = i18n.language === "ar";
  const LEVEL_META = isRTL ? LEVEL_METADATA_AR : LEVEL_METADATA_EN;

  // ── Render ─────────────────────────────────────────────────────────────────

  // ──────────────── LOADING VIEW ────────────────
  if (loading) {
    return (
      <div className={styles.gameContainer}>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            color: "#ffd700",
            fontSize: "28px",
            fontWeight: "bold",
            flexDirection: "column",
            gap: "15px",
          }}
        >
          <div
            className={styles.boatRipple}
            style={{
              width: "50px",
              height: "50px",
              border: "4px solid #ffd700",
              borderTopColor: "transparent",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          ></div>
          {t("readingQuest.loading", "جاري التحميل...")} ⏳
        </div>
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    );
  }

  // ... باقي الكود زي ما هو
  // ──────────────── LEVEL SELECTION VIEW ────────────────
  if (view === "levels") {
    const levelIds = Object.keys(LEVEL_META); // ["1","2","3","4"]
    return (
      <div className={styles.gameContainer}>
        {showPretestModal && (
          <PretestWelcomeModal
            unlockedLevel={progress.unlockedLevel}
            onDismiss={dismissPretestModal}
          />
        )}
        <nav className={styles.headerNav}>
          <div className={styles.scoreBoard}>
            📖 {t("readingQuest.title", "Reading Quest")}
          </div>
          <button className={styles.exitBtn} onClick={() => navigate("/home")}>
            {t("readingQuest.exit", "Exit Adventure")}
          </button>
        </nav>

        <div className={styles.selectionContainer}>
          <div className={styles.mapTitleContainer}>
            <h1 className={styles.mapTitle}>
              {t("readingQuest.selectLevel", "Select Your Level")}
            </h1>
            <p className={styles.mapSubtitle}>
              {t(
                "readingQuest.selectLevelSub",
                "Complete all stages to unlock the next level",
              )}
            </p>
          </div>

          <div className={styles.levelsGrid}>
            {levelIds.map((id) => {
              const meta = LEVEL_META[id];
              const num = parseInt(id, 10);
              const isLocked = num > progress.unlockedLevel;
              const completedCount = (
                progress.completedStages[id] || []
              ).filter(Boolean).length;
              const totalStages = 5;
              const pct = Math.round((completedCount / totalStages) * 100);
              const isRecommended = num === progress.recommendedLevel;

              return (
                <div
                  key={id}
                  className={`${styles.levelCard} ${isLocked ? styles.levelCardLocked : ""}`}
                  style={{
                    position: "relative",
                    ...(isRecommended
                      ? {
                          border: "3px solid #ffd700",
                          boxShadow: "0 0 20px #ffd700",
                        }
                      : {}),
                  }}
                  onClick={() => handleSelectLevel(id)}
                >
                  {isLocked && <div className={styles.lockOverlay}>🔒</div>}
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
                      {t("readingQuest.level", "Level")} {num}
                    </span>
                    <h3 className={styles.levelName}>{meta.name}</h3>
                    <p className={styles.levelFocus}>{meta.focus}</p>
                  </div>
                  <div className={styles.levelFooter}>
                    <div className={styles.levelProgressText}>
                      <span>
                        {completedCount} / {totalStages}
                      </span>
                      <span>{pct}%</span>
                    </div>
                    <div className={styles.progressBarBg}>
                      <div
                        className={styles.progressBarFill}
                        style={{ width: `${pct}%` }}
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

  // ──────────────── STAGE SELECTION VIEW ────────────────
  if (view === "stages") {
    const meta = LEVEL_META[selectedLevelId];
    const stageStars = progress.stars[selectedLevelId] || [0, 0, 0, 0, 0];
    const stageCompleted = progress.completedStages[selectedLevelId] || [
      false,
      false,
      false,
      false,
      false,
    ];

    return (
      <div className={styles.gameContainer}>
        <nav className={styles.headerNav}>
          <div className={styles.scoreBoard}>📖 {meta?.name || "Level"}</div>
          <button className={styles.exitBtn} onClick={() => setView("levels")}>
            ← {t("readingQuest.back", "Back")}
          </button>
        </nav>

        <div className={styles.selectionContainer}>
          <div className={styles.stagesHeader}>
            <h2 className={styles.stagesHeaderTitle}>
              {meta?.name || "Level"} — <span>{meta?.focus}</span>
            </h2>
            <button
              className={styles.backBtn}
              onClick={() => setView("levels")}
            >
              ← {t("readingQuest.backToLevels", "Back to Levels")}
            </button>
          </div>

          <div className={styles.stagesGrid}>
            {[0, 1, 2, 3, 4].map((stageIdx) => {
              const levelNum = parseInt(selectedLevelId, 10);
              const isUnlocked =
                stageIdx === 0 ||
                levelNum < progress.unlockedLevel ||
                stageCompleted[stageIdx - 1];
              const isComplete = stageCompleted[stageIdx];
              const starCount = stageStars[stageIdx] || 0;
              const isRecommended =
                levelNum === progress.recommendedLevel &&
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
                        background: "linear-gradient(135deg, #ffd700, #b8860b)",
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
                    className={`${styles.stageNode} ${!isUnlocked ? styles.stageNodeLocked : ""}`}
                    style={
                      isRecommended
                        ? {
                            boxShadow: "0 0 15px #ffd700, 0 0 5px #ffd700",
                            border: "3px solid #ffd700",
                          }
                        : {}
                    }
                    onClick={() => handleSelectStage(stageIdx)}
                  >
                    {!isUnlocked ? "🔒" : isComplete ? "✅" : stageIdx + 1}
                  </div>
                  <span className={styles.stageLabel}>
                    {t("readingQuest.stage", "Stage")} {stageIdx + 1}
                  </span>
                  <div className={styles.stageStars}>
                    {[1, 2, 3].map((s) => (
                      <span
                        key={s}
                        className={`${styles.star} ${s <= starCount ? styles.starActive : styles.starInactive}`}
                      >
                        ⭐
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ──────────────── GAME VIEW ────────────────
  const q = stageQuestions[currentQuestionIndex];
  const options = q?.options ?? [];

  return (
    <div className={styles.gameContainer}>
      <nav className={styles.headerNav}>
        <div className={styles.scoreBoard}>
          ⭐ {t("readingQuest.score", "Score")}: {score}
        </div>
        {apiError && (
          <div
            style={{
              background: "rgba(255,200,0,0.9)",
              color: "#333",
              padding: "6px 14px",
              borderRadius: 8,
              fontSize: "0.8rem",
              maxWidth: 260,
            }}
          >
            ⚠️ {apiError}
          </div>
        )}
        <button className={styles.exitBtn} onClick={() => setView("stages")}>
          ← {t("readingQuest.backToStages", "Back to Stages")}
        </button>
      </nav>

      <div className={styles.mainStage}>
        <div className={styles.scrollCard}>
          {!showQuestion ? (
            <div className={styles.readingMode}>
              <h2 className={styles.segmentTitle}>
                {t("readingQuest.readStory", "Read the Story")}
              </h2>
              <p className={styles.storyText}>{q?.text || "..."}</p>
              <div className={styles.controls}>
                <button
                  className={styles.speakBtn}
                  onClick={() => speakText(q?.text || "")}
                >
                  🔊 {t("readingQuest.listen", "Listen")}
                </button>
                <button className={styles.primaryBtn} onClick={handleNextClick}>
                  {t("readingQuest.startQuiz", "Start Quiz")} ➜
                </button>
              </div>
            </div>
          ) : (
            <div className={styles.quizMode}>
              <h2 className={styles.questionText}>
                {q?.question ||
                  t("readingQuest.defaultQuestion", "What did you read?")}
              </h2>
              <div className={styles.optionsGrid}>
                {options.map((opt, idx) => {
                  const isCorrect =
                    opt === q?.answer ||
                    opt?.toLowerCase() === q?.answer?.toLowerCase();
                  return (
                    <button
                      key={idx}
                      className={`${styles.optionCard} ${
                        feedback === "correct" && isCorrect
                          ? styles.correctCard
                          : ""
                      } ${
                        feedback === "wrong" && !isCorrect
                          ? styles.dimmedCard
                          : ""
                      }`}
                      onClick={() => handleOptionClick(opt)}
                    >
                      <span className={styles.optText}>{opt}</span>
                    </button>
                  );
                })}
              </div>
              {feedback && (
                <div className={`${styles.feedbackMsg} ${styles[feedback]}`}>
                  {feedback === "correct"
                    ? t(
                        "readingQuest.correctFeedback",
                        "Great! Boat is steady. 🚢",
                      )
                    : t(
                        "readingQuest.wrongFeedback",
                        "Oh no! Drifting closer! 🌊",
                      )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className={styles.progressText}>
          {t("readingQuest.question", "Question")} {currentQuestionIndex + 1} /{" "}
          {stageQuestions.length}
        </div>
      </div>

      <div className={styles.riverFooter}>
        <div className={styles.dangerLabel}>
          ⚠️ {t("readingQuest.dangerZone", "DANGER ZONE")}
        </div>
        <div className={styles.waterSurface} />
        <div className={styles.waterPath}>
          <div
            className={styles.waterLevel}
            style={{ width: `${waterLevel}%` }}
          >
            <div className={styles.dynamicBoat}>
              <BoatSVG className={styles.svgGraphic} />
              <div className={styles.boatRipple} />
            </div>
          </div>
          <div className={styles.dynamicDanger}>
            <TornadoSVG className={styles.svgGraphic} />
          </div>
        </div>
      </div>

      {gameStatus === "won" ? (
        <WinModal score={score} restartGame={restartGame}>
          {t("readingQuest.winMsg", "You safely navigated all questions! 🏝️")}
        </WinModal>
      ) : gameStatus === "lost" ? (
        <LoseModal score={score} restartGame={restartGame}>
          {t("readingQuest.loseMsg", "The current was too strong. Try again!")}
        </LoseModal>
      ) : null}
    </div>
  );
}

export default ReadingQuest;
