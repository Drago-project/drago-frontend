// src/games/WordHunt.jsx
import React, { useState, useEffect } from "react";
import Confetti from "react-confetti";
import Lottie from "lottie-react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle,
  XCircle,
  Volume2,
  Heart,
  Home,
  ChevronRight,
} from "lucide-react";
import { hutGameAPI, profileAPI, gameProgressAPI } from "../server/endpoints";
import { getAuthUser } from "../server/auth";

import "../styles/WordHut.css";

import sad from "../assets/emotions/drago(crying).svg";
import celebrationAnimation from "../assets/animation/celebration drago.json";

// ─── Constants ───────────────────────────────────────────────
const STAGES_PER_LEVEL = 5;
const WORDS_PER_STAGE = 5;
const STORAGE_KEY = "word_hunt_progress";

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

// ─── Sound helpers ────────────────────────────────────────────
const gameSounds = {
  correct: new Audio(
    "https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3",
  ),
  wrong: new Audio(
    "https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3",
  ),
  click: new Audio(
    "https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3",
  ),
};

const playSystemSound = (type) => {
  const sounds = { win: "/sounds/win.mp3", lose: "/sounds/hut_lose.mp3" };
  if (sounds[type]) new Audio(sounds[type]).play().catch(() => {});
};

const playSound = (type) => {
  const audio = gameSounds[type];
  if (audio) {
    audio.currentTime = 0;
    audio.play().catch(() => {});
  }
};

const speakLetter = (e, letter) => {
  if (e && e.stopPropagation) e.stopPropagation();

  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(letter);
    utterance.lang = "ar-SA";
    utterance.rate = 0.7;
    window.speechSynthesis.speak(utterance);
  }
};

const playOptionAudio = (e, audioUrl, letter) => {
  if (e && e.stopPropagation) e.stopPropagation();

  if (audioUrl) {
    const audio = new Audio(audioUrl);
    audio.play().catch((err) => {
      console.warn(
        "Backend audio missing or failed, falling back to Browser TTS:",
        err,
      );
      speakLetter(null, letter);
    });
  } else {
    speakLetter(null, letter);
  }
};

// ─── Win / Lose Modals ─────────────────────────────────────────
const WinModal = ({ score, starsEarned, onContinue, onReplay }) => {
  const navigate = useNavigate();
  useEffect(() => {
    playSystemSound("win");
  }, []);
  return (
    <div className="wh-modal-overlay">
      <Confetti
        width={window.innerWidth}
        height={window.innerHeight}
        recycle={false}
      />
      <div className="wh-modal win">
        <div className="wh-modal-emoji">
          <Lottie
            animationData={celebrationAnimation}
            loop={true}
            autoplay={true}
          />
        </div>
        <h2 className="wh-modal-title">!أنت بطل</h2>
        <div style={{ fontSize: "2rem", margin: "8px 0" }}>
          {[1, 2, 3].map((s) => (
            <span
              key={s}
              style={{
                color: s <= starsEarned ? "#ffd700" : "rgba(255,255,255,0.3)",
                textShadow: s <= starsEarned ? "0 0 10px #ffd700" : "none",
              }}
            >
              ★
            </span>
          ))}
        </div>
        <p className="wh-modal-score">
          النتيجة: {score} / {WORDS_PER_STAGE}
        </p>
        <div className="wh-btn-container">
          <button className="wh-modal-btn" onClick={onContinue}>
            التالي
          </button>
          <button className="wh-modal-btn" onClick={onReplay}>
            إعادة
          </button>
          <button className="wh-exit-btn" onClick={() => navigate("/home")}>
            خروج
          </button>
        </div>
      </div>
    </div>
  );
};

const LoseModal = ({ score, onReplay }) => {
  const navigate = useNavigate();
  useEffect(() => {
    playSystemSound("lose");
  }, []);
  return (
    <div className="wh-modal-overlay">
      <div className="wh-modal lose">
        <div className="wh-modal-emoji">
          <img src={sad} alt="Sad Drago" className="wh-sad-anim" />
        </div>
        <h2 className="wh-modal-title">!انتهت القلوب</h2>
        <p className="wh-modal-subtitle">لا تحزن، يمكنك المحاولة مرة أخرى</p>
        <p className="wh-modal-score">
          النتيجة: {score} / {WORDS_PER_STAGE}
        </p>
        <div className="wh-btn-container">
          <button className="wh-modal-btn" onClick={onReplay}>
            حاول مرة أخرى
          </button>
          <button className="wh-exit-btn" onClick={() => navigate("/home")}>
            خروج
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Progress helpers ─────────────────────────────────────────
const loadProgress = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        ...defaultProgress,
        ...parsed,
        completedStages: {
          ...defaultProgress.completedStages,
          ...parsed.completedStages,
        },
        stars: { ...defaultProgress.stars, ...parsed.stars },
      };
    }
  } catch (e) {
    console.warn("Failed to load progress from localStorage:", e);
  }
  return defaultProgress;
};

const saveProgress = (prog) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prog));
  } catch (e) {
    console.warn("Failed to save progress to localStorage:", e);
  }
};

// ─── Pretest Welcome Modal ─────────────────────────────────────
const PretestWelcomeModal = ({ unlockedLevel, onDismiss }) => {
  return (
    <div className="wh-modal-overlay" style={{ zIndex: 9999 }}>
      <div
        className="wh-modal win"
        style={{
          maxWidth: "480px",
          background: "linear-gradient(135deg, #1e1b4b, #311042)",
          border: "3px solid #ffd700",
        }}
      >
        <div
          style={{
            fontSize: "4.5rem",
            marginBottom: "1rem",
            filter: "drop-shadow(0 0 10px #ffd700)",
          }}
        >
          🌟
        </div>
        <h2 className="wh-modal-title">مرحباً بك يا بطل!</h2>
        <p
          className="wh-modal-subtitle"
          style={{
            fontSize: "1.15rem",
            lineHeight: "1.6",
            margin: "10px 0 24px",
            color: "#fef3c7",
          }}
        >
          بناءً على أدائك الرائع في التقييم القَبلي، قمنا بفتح المستويات الأولى
          لتخطي المهارات التي تتقنها بالفعل.
          <br />
          <strong
            style={{
              color: "#ffd700",
              display: "block",
              marginTop: "8px",
              fontSize: "1.3rem",
            }}
          >
            تبدأ مغامرتك مباشرة من المستوى {unlockedLevel}!
          </strong>
        </p>
        <div className="wh-btn-container">
          <button
            className="wh-modal-btn"
            onClick={onDismiss}
            style={{ padding: "12px 36px", fontSize: "1.2rem" }}
          >
            ابدأ اللعب الآن!
          </button>
        </div>
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

// ─── Main Component ───────────────────────────────────────────
const WordHuntGame = () => {
  // const navigate = useNavigate();

  // View state: "levels" | "stages" | "game"
  const [view, setView] = useState("levels");
  const [progress, setProgress] = useState(loadProgress);
  const [showPretestModal, setShowPretestModal] = useState(false);

  useEffect(() => {
    const fetchProgress = async () => {
      const authUser = getAuthUser();
      const uId = authUser?.userId;
      if (!uId) return;

      try {
        const res = await gameProgressAPI.getByUser(uId);
        const progressList = res.data?.data || res.data;
        const bgProgress = Array.isArray(progressList)
          ? progressList.find((p) => p.gameKey === "word_hunt")
          : null;

        if (bgProgress) {
          const reconstructed = reconstructDetailedProgress(bgProgress, 6, 5);
          setProgress(reconstructed);
          saveProgress(reconstructed);
        }
      } catch (err) {
        console.error("Failed to fetch backend progress for word_hunt:", err);
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
      saveProgress(updated);
      return updated;
    });
  };

  // API level data
  const [apiLevels, setApiLevels] = useState([]);
  const [apiLoading, setApiLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  // Selection state
  const [selectedLevelId, setSelectedLevelId] = useState(null);
  const [selectedStageIndex, setSelectedStageIndex] = useState(null);

  // Game state
  const [gameQuestions, setGameQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [gameState, setGameState] = useState("playing"); // "playing" | "loading" | "won" | "lost"
  const [selectedOption, setSelectedOption] = useState(null);
  const [starsEarned, setStarsEarned] = useState(0);

  // Session tracking
  const [sessionId, setSessionId] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [userId, setUserId] = useState(null);

  // ── Fetch levels on mount ─────────────────────────────────
  useEffect(() => {
    const fetchLevels = async () => {
      try {
        setApiLoading(true);
        setApiError(null);
        const res = await hutGameAPI.getLevels();
        const levels = res.data?.data || [];
        setApiLevels(levels);
      } catch (err) {
        console.error("Failed to fetch hut levels:", err);
        setApiError("تعذّر تحميل المستويات. تحقق من الاتصال وأعد المحاولة.");
      } finally {
        setApiLoading(false);
      }
    };
    fetchLevels();

    const authUser = getAuthUser();
    if (authUser?.userId) setUserId(authUser.userId);
  }, []);

  // ── Level selection helpers ───────────────────────────────
  const isLevelUnlocked = (levelIndex) => {
    return levelIndex + 1 <= progress.unlockedLevel;
  };

  const getLevelStagesCompleted = (levelNum) => {
    const stages = progress.completedStages[String(levelNum)] || [
      false,
      false,
      false,
      false,
      false,
    ];
    return stages.filter(Boolean).length;
  };

  const getTotalStarsForLevel = (levelNum) => {
    const stars = progress.stars[String(levelNum)] || [0, 0, 0, 0, 0];
    return stars.reduce((a, b) => a + b, 0);
  };

  // ── Stage helpers ─────────────────────────────────────────
  const isStageUnlocked = (levelNum, stageIndex) => {
    if (stageIndex === 0) return true;
    if (parseInt(levelNum, 10) < progress.unlockedLevel) return true;
    const stages = progress.completedStages[String(levelNum)] || [];
    return stages[stageIndex - 1] === true;
  };

  const getStageStars = (levelNum, stageIndex) => {
    return (progress.stars[String(levelNum)] || [])[stageIndex] || 0;
  };

  // ── Start stage game ──────────────────────────────────────
  const startStage = async (levelId, stageIndex) => {
    const levelNum = apiLevels[levelId - 1]?.levelNumber ?? levelId;
    setSelectedLevelId(levelId);
    setSelectedStageIndex(stageIndex);
    setGameState("loading");
    setView("game");
    setScore(0);
    setLives(3);
    setCurrentQuestion(0);
    setShowFeedback(false);
    setSelectedOption(null);
    setStarsEarned(0);

    try {
      // Start session
      if (userId) {
        try {
          const sessionRes = await hutGameAPI.startSession(userId, levelNum);
          setSessionId(sessionRes.data?.data?.sessionId);
          setStartTime(Date.now());
        } catch (sessErr) {
          console.warn("Session start error:", sessErr);
        }
      }

      // Fetch words
      const fetches = Array.from({ length: WORDS_PER_STAGE }).map(() =>
        hutGameAPI.getRandomWord(levelNum),
      );
      const responses = await Promise.all(fetches);

      const questions = responses
        .map((res, idx) => {
          const d = res?.data?.data;
          if (!d) return null;
          const full = d.fullWord || "";
          const missing = d.missingLetter || d.missing || "";
          const missIdx = full.indexOf(missing);
          const wordBefore =
            missIdx >= 0 ? full.slice(0, missIdx) : d.wordDisplay || "";
          const wordAfter =
            missIdx >= 0 ? full.slice(missIdx + missing.length) : "";
          return {
            id: idx + 1,
            wordBefore,
            wordAfter,
            missing,
            options: d.options || [],
            hint: d.hint || "",
            // Audio data (optional)
            audioBasePath: d.audioBasePath || "",
            audioFormat: d.audioFormat || "",
            optionsAudio: d.optionsAudio || [],
          };
        })
        .filter(Boolean);

      if (questions.length === 0) throw new Error("No questions returned");

      setGameQuestions(questions);
      setGameState("playing");
    } catch (err) {
      console.error("Stage load error:", err);
      setApiError("تعذّر تحميل كلمات المرحلة. أعد المحاولة.");
      setView("stages");
    }
  };

  // ── Answer handler ────────────────────────────────────────
  const handleAnswer = (selectedLetter) => {
    if (gameState !== "playing" || showFeedback) return;

    setSelectedOption(selectedLetter);
    const currentWord = gameQuestions[currentQuestion];
    const correct = selectedLetter === currentWord.missing;

    if (sessionId) {
      hutGameAPI.submitAnswer(sessionId, correct).catch(() => {});
    }

    if (correct) {
      setIsCorrect(true);
      const newScore = score + 1;
      setScore(newScore);
      playSound("correct");
      setTimeout(() => setShowFeedback(true), 300);
      setTimeout(() => {
        if (currentQuestion < gameQuestions.length - 1) {
          setCurrentQuestion((q) => q + 1);
          setShowFeedback(false);
          setSelectedOption(null);
        } else {
          handleStageComplete(newScore, lives);
        }
      }, 1800);
    } else {
      setIsCorrect(false);
      playSound("wrong");
      setTimeout(() => setShowFeedback(true), 300);
      const newLives = lives - 1;
      setLives(newLives);
      if (newLives === 0) {
        setTimeout(() => handleStageComplete(score, 0), 1500);
      } else {
        setTimeout(() => {
          setShowFeedback(false);
          setSelectedOption(null);
        }, 1500);
      }
    }
  };

  // ── Stage completion ───────────────────────────────────────
  const handleStageComplete = async (finalScore, remainingLives) => {
    const won = remainingLives > 0 || finalScore === WORDS_PER_STAGE;
    const stars = won ? remainingLives : 0; // 3 lives = 3★, 2 = 2★, 1 = 1★
    setStarsEarned(stars);

    // Finish session
    if (sessionId && startTime) {
      const timeSeconds = Math.floor((Date.now() - startTime) / 1000);
      hutGameAPI.finishSession(sessionId, timeSeconds).catch(() => {});
      setSessionId(null);
    }

    // Award XP if won
    if (userId && won) {
      profileAPI.awardXP(userId, finalScore * 10, true).catch(() => {});
    }

    if (won) {
      // Update progress
      setProgress((prev) => {
        const levelKey = String(selectedLevelId);
        const newCompleted = { ...prev.completedStages };
        const newStars = { ...prev.stars };

        if (!newCompleted[levelKey])
          newCompleted[levelKey] = [false, false, false, false, false];
        if (!newStars[levelKey]) newStars[levelKey] = [0, 0, 0, 0, 0];

        const levelCompleted = [...newCompleted[levelKey]];
        const levelStars = [...newStars[levelKey]];
        levelCompleted[selectedStageIndex] = true;
        levelStars[selectedStageIndex] = Math.max(
          levelStars[selectedStageIndex],
          stars,
        );

        newCompleted[levelKey] = levelCompleted;
        newStars[levelKey] = levelStars;

        // Check if all stages in this level are done → unlock next level
        let newUnlocked = prev.unlockedLevel;
        if (levelCompleted.every(Boolean)) {
          newUnlocked = Math.max(prev.unlockedLevel, selectedLevelId + 1);
        }

        const updated = {
          ...prev,
          completedStages: newCompleted,
          stars: newStars,
          unlockedLevel: newUnlocked,
        };
        saveProgress(updated);

        // Synchronize with backend
        let totalCompletedStages = 0;
        Object.keys(newCompleted).forEach((level) => {
          totalCompletedStages += newCompleted[level].filter(Boolean).length;
        });

        let totalStars = 0;
        Object.keys(newStars).forEach((level) => {
          totalStars += newStars[level].reduce((sum, s) => sum + s, 0);
        });

        const maxStages = 6 * 5;
        const completionPercent = Math.min(
          100,
          Math.round((totalCompletedStages / maxStages) * 100),
        );

        if (userId) {
          // Record this specific stage completion
          gameProgressAPI
            .completeStage(userId, {
              gameKey: "word_hunt",
              stageNumber: selectedStageIndex + 1,
              score: finalScore,
              starsEarned: stars,
            })
            .catch((err) => {
              console.error("Failed to complete stage on backend:", err);
            });

          // Update aggregate progress
          gameProgressAPI
            .update(userId, {
              gameKey: "word_hunt",
              levelReached: newUnlocked,
              completedStages: totalCompletedStages,
              starsEarned: totalStars,
              completionPercent,
            })
            .catch((err) => {
              console.error("Failed to update backend progress:", err);
            });
        }

        return updated;
      });

      setGameState("won");
    } else {
      setGameState("lost");
    }
  };

  const getButtonClass = (letter) => {
    if (selectedOption !== letter) return "wh-option-btn wh-opt-default";
    return isCorrect
      ? "wh-option-btn wh-opt-correct"
      : "wh-option-btn wh-opt-wrong";
  };

  const handleContinue = () => {
    // Try to open next stage
    const nextStage = selectedStageIndex + 1;
    if (nextStage < STAGES_PER_LEVEL) {
      startStage(selectedLevelId, nextStage);
    } else {
      setView("stages");
      setGameState("playing");
    }
  };

  const handleReplay = () => {
    startStage(selectedLevelId, selectedStageIndex);
  };

  // ─── Page wrapper ──────────────────────────────────────────
  const PageWrapper = ({ children, wide = false }) => (
    <div className="wh-full-page">
      <div
        className={wide ? "wh-wrapper" : "wh-wrapper"}
        style={wide ? { maxWidth: "900px", width: "95%" } : {}}
      >
        {children}
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════════════
  // VIEW: LEVELS
  // ═══════════════════════════════════════════════════════════
  if (view === "levels") {
    if (apiLoading) {
      return (
        <div className="wh-full-page">
          <div className="wh-wrapper">
            <div className="wh-loading-container">
              <div className="wh-loading-spinner">⏳</div>
              <p style={{ color: "#fef3c7", fontWeight: 700 }}>
                جارٍ تحميل المستويات...
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (apiError) {
      return (
        <div className="wh-full-page">
          <div className="wh-wrapper">
            <div className="wh-loading-container">
              <div className="wh-error-box">
                <h3>⚠️ خطأ في التحميل</h3>
                <p>{apiError}</p>
                <button
                  className="wh-retry-btn"
                  onClick={() => window.location.reload()}
                >
                  إعادة المحاولة
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    const levelCards =
      apiLevels.length > 0
        ? apiLevels
        : Array.from({ length: 6 }, (_, i) => ({
            levelNumber: i + 1,
            description: `المستوى ${i + 1}`,
          }));

    return (
      <div className="wh-full-page">
        {showPretestModal && (
          <PretestWelcomeModal
            unlockedLevel={progress.unlockedLevel}
            onDismiss={dismissPretestModal}
          />
        )}
        <div
          style={{
            width: "95%",
            maxWidth: "900px",
            overflowY: "auto",
            maxHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "30px 0",
          }}
        >
          {/* Header */}
          <div className="wh-map-title-container">
            <h1 className="wh-map-title">🏠 كوخ الكلمات</h1>
            <p className="wh-map-subtitle">اختر مستوى وابدأ رحلتك!</p>
          </div>

          {/* Level Cards */}
          <div className="wh-levels-grid">
            {levelCards.map((level, idx) => {
              const levelNum = level.levelNumber ?? idx + 1;
              const isUnlocked = isLevelUnlocked(idx);
              const completed = getLevelStagesCompleted(levelNum);
              const totalStars = getTotalStarsForLevel(levelNum);
              const pct = Math.round((completed / STAGES_PER_LEVEL) * 100);
              const isRecommended = levelNum === progress.recommendedLevel;

              return (
                <div
                  key={levelNum}
                  className={`wh-level-card${!isUnlocked ? " wh-level-card-locked" : ""}`}
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
                  onClick={() => {
                    if (!isUnlocked) return;
                    setSelectedLevelId(levelNum);
                    setView("stages");
                  }}
                >
                  {!isUnlocked && <div className="wh-lock-overlay">🔒</div>}
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

                  <div className="wh-level-card-content">
                    <div className="wh-level-num">المستوى {levelNum}</div>
                    <h3 className="wh-level-name">
                      {level.description || level.name || `المستوى ${levelNum}`}
                    </h3>
                    <p className="wh-level-focus">
                      {isUnlocked
                        ? totalStars > 0
                          ? `⭐ ${totalStars} / ${STAGES_PER_LEVEL * 3} نجمة`
                          : completed > 0
                            ? `✅ ${completed} مراحل مكتملة`
                            : "ابدأ هنا"
                        : "أكمل المستوى السابق للفتح"}
                    </p>
                  </div>

                  <div className="wh-level-footer">
                    <div className="wh-level-progress-text">
                      <span>{pct}%</span>
                      <span>
                        {completed}/{STAGES_PER_LEVEL} مراحل
                      </span>
                    </div>
                    <div className="wh-progress-bar-bg">
                      <div
                        className="wh-progress-bar-fill-level"
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

  // ═══════════════════════════════════════════════════════════
  // VIEW: STAGES
  // ═══════════════════════════════════════════════════════════
  if (view === "stages") {
    const levelNum = selectedLevelId;
    const levelInfo = apiLevels.find(
      (l) => (l.levelNumber ?? 0) === levelNum,
    ) || { description: `المستوى ${levelNum}` };

    return (
      <div className="wh-full-page">
        <div
          style={{
            width: "95%",
            maxWidth: "900px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "30px 0",
            overflowY: "auto",
            maxHeight: "100vh",
          }}
        >
          {/* Header */}
          <div
            className="wh-stages-header"
            style={{
              width: "100%",
              boxSizing: "border-box",
              marginBottom: "40px",
            }}
          >
            <h2 className="wh-stages-header-title">
              🏠 <span>المستوى {levelNum}</span> —{" "}
              {levelInfo.description || `المستوى ${levelNum}`}
            </h2>
            <button className="wh-back-btn" onClick={() => setView("levels")}>
              ← العودة للخريطة
            </button>
          </div>

          {/* Stage nodes */}
          <div className="wh-stages-grid">
            {Array.from({ length: STAGES_PER_LEVEL }, (_, stageIdx) => {
              const unlocked = isStageUnlocked(levelNum, stageIdx);
              const stars = getStageStars(levelNum, stageIdx);
              const isRecommended =
                levelNum === progress.recommendedLevel &&
                stageIdx === (progress.recommendedStage - 1 || 0);

              return (
                <div
                  key={stageIdx}
                  className="wh-stage-node-wrapper"
                  style={{ position: "relative" }}
                >
                  {isRecommended && (
                    <div
                      style={{
                        position: "absolute",
                        top: "-22px",
                        background: "linear-gradient(135deg, #ffd700, #b8860b)",
                        color: "#1a0f00",
                        padding: "2px 8px",
                        borderRadius: "10px",
                        fontSize: "10px",
                        fontWeight: "bold",
                        whiteSpace: "nowrap",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
                        zIndex: 2,
                        animation: "bounce 1.5s infinite",
                      }}
                    >
                      بداية المسار 🚀
                    </div>
                  )}
                  <div
                    className={`wh-stage-node${!unlocked ? " wh-stage-node-locked" : ""}`}
                    style={
                      isRecommended
                        ? {
                            boxShadow: "0 0 15px #ffd700, 0 0 5px #ffd700",
                            border: "3px solid #ffd700",
                          }
                        : {}
                    }
                    onClick={() => {
                      if (unlocked) startStage(levelNum, stageIdx);
                    }}
                  >
                    {unlocked ? stageIdx + 1 : "🔒"}
                  </div>
                  <div className="wh-stage-label">المرحلة {stageIdx + 1}</div>
                  <div className="wh-stage-stars">
                    {[1, 2, 3].map((s) => (
                      <span
                        key={s}
                        className={`wh-star ${s <= stars ? "wh-star-active" : "wh-star-inactive"}`}
                      >
                        ★
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

  // ═══════════════════════════════════════════════════════════
  // VIEW: GAME
  // ═══════════════════════════════════════════════════════════
  if (gameState === "loading") {
    return (
      <div className="wh-full-page">
        <div className="wh-wrapper">
          <div className="wh-loading-container">
            <div className="wh-loading-spinner">⏳</div>
            <p style={{ color: "#fef3c7", fontWeight: 700 }}>
              جارٍ تحضير الكلمات...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === "won") {
    return (
      <WinModal
        score={score}
        starsEarned={starsEarned}
        onContinue={handleContinue}
        onReplay={handleReplay}
      />
    );
  }

  if (gameState === "lost") {
    return <LoseModal score={score} onReplay={handleReplay} />;
  }

  // Playing
  const currentData = gameQuestions[currentQuestion];
  const progressPercentage =
    gameQuestions.length > 0
      ? (currentQuestion / gameQuestions.length) * 100
      : 0;

  if (!currentData) return null;

  return (
    <div className="wh-full-page">
      <div className="wh-wrapper">
        {/* Game Header */}
        <div className="wh-header">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              fontWeight: "bold",
            }}
          >
            <Home size={24} />
            <span>
              المستوى {selectedLevelId} — المرحلة {selectedStageIndex + 1}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ display: "flex", gap: "4px" }}>
              {[...Array(3)].map((_, i) => (
                <Heart
                  key={i}
                  size={24}
                  fill={i < lives ? "#ef4444" : "#4b5563"}
                  color={i < lives ? "#ef4444" : "#4b5563"}
                  style={{ opacity: i < lives ? 1 : 0.3 }}
                />
              ))}
            </div>
            <button
              onClick={() => {
                setView("stages");
                setGameState("playing");
              }}
              style={{
                background: "none",
                border: "none",
                color: "#fff",
                cursor: "pointer",
                fontSize: "12px",
                opacity: 0.8,
              }}
            >
              ✕ خروج
            </button>
          </div>
        </div>

        {/* Game Body */}
        <div className="wh-game-container">
          {/* Progress bar */}
          <div className="wh-progress-bar">
            <div
              className="wh-progress-fill"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          {/* Question counter */}
          <div
            style={{
              textAlign: "center",
              fontSize: "0.9rem",
              color: "#6b7280",
              fontWeight: 600,
              marginBottom: "8px",
            }}
          >
            {currentQuestion + 1} / {gameQuestions.length}
          </div>

          <div
            style={{
              flexGrow: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            {/* Hint */}
            {currentData.hint && (
              <div style={{ textAlign: "center", marginBottom: "20px" }}>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    backgroundColor: "#fffbeb",
                    color: "#d97706",
                    padding: "8px 20px",
                    borderRadius: "9999px",
                    fontWeight: "bold",
                    fontSize: "1.2rem",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                    border: "1px solid #fde68a",
                  }}
                >
                  <span>💡</span>
                  <span>{currentData.hint}</span>
                </div>
              </div>
            )}

            {/* Word display */}
            <div className="wh-word-display">
              <div className="wh-word-text">
                <span>{currentData.wordBefore}</span>
                <span className="wh-missing-letter">?</span>
                <span>{currentData.wordAfter}</span>
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="wh-options-grid">
            {currentData.options.map((letter, index) => {
              const audioFileName = currentData.optionsAudio?.[index];
              let audioUrl = null;
              console.log(import.meta.env.VITE_API_URL);
              console.log(audioUrl);

              if (audioFileName) {
                if (
                  audioFileName.includes("/") ||
                  audioFileName.includes(".")
                ) {
                  audioUrl = audioFileName;
                } else {
                  let basePath = currentData.audioBasePath || "";
                  let format = currentData.audioFormat || "";

                  if (basePath && !basePath.endsWith("/")) basePath += "/";
                  if (format && !format.startsWith(".")) format = "." + format;

                  audioUrl = `${basePath}${audioFileName}${format}`;
                }

                if (
                  audioUrl &&
                  !audioUrl.startsWith("http") &&
                  !audioUrl.startsWith("/")
                ) {
                  audioUrl = "/" + audioUrl;
                }
                const backendBaseUrl = import.meta.env.VITE_API_URL;

                if (audioUrl && !audioUrl.startsWith("http")) {
                  const cleanBaseUrl = backendBaseUrl.endsWith("/")
                    ? backendBaseUrl.slice(0, -1)
                    : backendBaseUrl;

                  audioUrl = `${cleanBaseUrl}${audioUrl}`;
                }
              }
              console.log(`Audio URL for letter ${letter}:`, audioUrl);
              return (
                <div
                  key={index}
                  className={getButtonClass(letter)}
                  style={{
                    position: "relative",
                    padding: 0,
                    display: "flex",
                    overflow: "hidden",
                    cursor:
                      showFeedback || selectedOption !== null
                        ? "default"
                        : "pointer",
                    opacity: showFeedback || selectedOption !== null ? 0.7 : 1,
                  }}
                >
                  <div
                    onClick={() => {
                      if (!showFeedback && selectedOption === null)
                        handleAnswer(letter);
                    }}
                    style={{
                      flexGrow: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "16px",
                    }}
                  >
                    <span>{letter}</span>
                  </div>
                  <div
                    style={{ width: "2px", background: "rgba(0,0,0,0.1)" }}
                  />
                  <div
                    onClick={(e) => {
                      if (!showFeedback && selectedOption === null) {
                        playOptionAudio(e, audioUrl, letter);
                      }
                    }}
                    style={{
                      width: "70px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "rgba(255,255,255,0.4)",
                      transition: "background 0.2s",
                    }}
                    onMouseOver={(e) =>
                      (e.currentTarget.style.background =
                        "rgba(255,255,255,0.6)")
                    }
                    onMouseOut={(e) =>
                      (e.currentTarget.style.background =
                        "rgba(255,255,255,0.4)")
                    }
                  >
                    <Volume2 size={24} color="#2563eb" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Feedback overlay */}
          {showFeedback && (
            <div className={`wh-feedback ${isCorrect ? "success" : "error"}`}>
              {isCorrect ? (
                <>
                  <CheckCircle
                    size={80}
                    color="#22c55e"
                    style={{ marginBottom: "1rem" }}
                  />
                  <h3
                    style={{
                      fontSize: "2rem",
                      color: "#15803d",
                      fontWeight: "bold",
                    }}
                  >
                    مُمتاز!
                  </h3>
                </>
              ) : (
                <>
                  <XCircle
                    size={80}
                    color="#ef4444"
                    style={{ marginBottom: "1rem" }}
                  />
                  <h3
                    style={{
                      fontSize: "2rem",
                      color: "#b91c1c",
                      fontWeight: "bold",
                    }}
                  >
                    خطأ!
                  </h3>
                  <p style={{ color: "#dc2626", fontWeight: "bold" }}>
                    خسرت قلب 💔
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WordHuntGame;
