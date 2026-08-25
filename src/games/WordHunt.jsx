// src/games/WordHunt.jsx

import React, { useState, useEffect, useRef } from "react";

import Confetti from "react-confetti";
import Lottie from "lottie-react";
import { useNavigate } from "react-router-dom";

import { CheckCircle, XCircle, Volume2, Heart, Home } from "lucide-react";

import { hutGameAPI, profileAPI, gameProgressAPI } from "../server/endpoints";

import { getAuthUser, getProgressStorageKey } from "../server/auth";

import { recordXpAttempt } from "../utils/xpDebug";

import "../styles/WordHut.css";

import sad from "../assets/emotions/drago(crying).svg";

import celebrationAnimation from "../assets/animation/celebration drago.json";

// ─────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────

const TOTAL_LEVELS = 6;
const STAGES_PER_LEVEL = 5;
const WORDS_PER_STAGE = 5;

const STORAGE_KEY = "word_hunt_progress";

// ─────────────────────────────────────────────────────────────
// Default Progress
// ─────────────────────────────────────────────────────────────

const createEmptyStages = () => Array(STAGES_PER_LEVEL).fill(false);

const createEmptyStars = () => Array(STAGES_PER_LEVEL).fill(0);

const makeDefaultProgress = () => ({
  unlockedLevel: 1,

  recommendedLevel: 1,

  recommendedStage: 1,

  completedStages: Object.fromEntries(
    Array.from({ length: TOTAL_LEVELS }, (_, i) => [
      String(i + 1),
      createEmptyStages(),
    ]),
  ),

  stars: Object.fromEntries(
    Array.from({ length: TOTAL_LEVELS }, (_, i) => [
      String(i + 1),
      createEmptyStars(),
    ]),
  ),

  totalStars: 0,

  totalCompletedStages: 0,

  showPretestWelcome: false,
});

// ─────────────────────────────────────────────────────────────
// LocalStorage fallback only
// ─────────────────────────────────────────────────────────────

const loadLocalProgressFallback = () => {
  try {
    const stored = localStorage.getItem(getProgressStorageKey(STORAGE_KEY));

    if (stored) {
      const parsed = JSON.parse(stored);
      const def = makeDefaultProgress();

      return {
        ...def,
        ...parsed,

        completedStages: {
          ...def.completedStages,
          ...(parsed.completedStages || {}),
        },

        stars: {
          ...def.stars,
          ...(parsed.stars || {}),
        },
      };
    }
  } catch (e) {
    console.warn("Failed to load progress from localStorage:", e);
  }

  return makeDefaultProgress();
};

const saveProgress = (prog) => {
  try {
    localStorage.setItem(
      getProgressStorageKey(STORAGE_KEY),
      JSON.stringify(prog),
    );
  } catch (e) {
    console.warn("Failed to save progress to localStorage:", e);
  }
};

// ─────────────────────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────────────────────

const clamp = (value, min, max) =>
  Math.min(max, Math.max(min, Number(value) || min));

// ─────────────────────────────────────────────────────────────
// Backend Progress Normalization
// ─────────────────────────────────────────────────────────────

const normalizeBackendProgress = (
  progressData,
  totalLevels = TOTAL_LEVELS,
  stagesPerLevel = STAGES_PER_LEVEL,
) => {
  const completedStages = {};
  const stars = {};

  for (let level = 1; level <= totalLevels; level++) {
    completedStages[String(level)] = createEmptyStages();

    stars[String(level)] = createEmptyStars();
  }

  const backendProgress = Array.isArray(progressData)
    ? progressData.find((item) => item.gameKey === "word_hunt")
    : progressData?.gameKey === "word_hunt"
      ? progressData
      : null;

  if (!backendProgress) {
    return makeDefaultProgress();
  }

  const levelReached = clamp(backendProgress.levelReached, 1, totalLevels);

  const totalCompletedStages = clamp(
    backendProgress.completedStages,
    0,
    totalLevels * stagesPerLevel,
  );

  const totalStars = clamp(
    backendProgress.starsEarned,
    0,
    totalLevels * stagesPerLevel * 3,
  );

  let remaining = totalCompletedStages;

  // Levels before reached level
  for (let level = 1; level < levelReached; level++) {
    const count = Math.min(remaining, stagesPerLevel);

    for (let stage = 0; stage < count; stage++) {
      completedStages[String(level)][stage] = true;
    }

    remaining -= count;
  }

  // Completed stages in reached level
  const currentLevelCompleted = Math.min(remaining, stagesPerLevel);

  for (let stage = 0; stage < currentLevelCompleted; stage++) {
    completedStages[String(levelReached)][stage] = true;
  }

  // Determine next recommended location
  let recommendedLevel = levelReached;

  let recommendedStage = 1;

  const firstIncompleteStage = completedStages[String(levelReached)].findIndex(
    (completed) => !completed,
  );

  if (firstIncompleteStage !== -1) {
    recommendedStage = firstIncompleteStage + 1;
  } else if (levelReached < totalLevels) {
    recommendedLevel = levelReached + 1;

    recommendedStage = 1;
  } else {
    recommendedLevel = totalLevels;

    recommendedStage = stagesPerLevel;
  }

  return {
    unlockedLevel: levelReached,

    recommendedLevel,

    recommendedStage,

    completedStages,

    stars,

    totalStars,

    totalCompletedStages,

    showPretestWelcome: levelReached > 1 && totalCompletedStages === 0,
  };
};

// ─────────────────────────────────────────────────────────────
// Sound helpers
// ─────────────────────────────────────────────────────────────

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
  const sounds = {
    win: "/sounds/win.mp3",
    lose: "/sounds/hut_lose.mp3",
  };

  if (sounds[type]) {
    new Audio(sounds[type]).play().catch(() => {});
  }
};

const playSound = (type) => {
  const audio = gameSounds[type];

  if (audio) {
    audio.currentTime = 0;

    audio.play().catch(() => {});
  }
};

const speakLetter = (e, letter) => {
  if (e && e.stopPropagation) {
    e.stopPropagation();
  }

  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(letter);

    utterance.lang = "ar-SA";
    utterance.rate = 0.7;

    window.speechSynthesis.speak(utterance);
  }
};

const playOptionAudio = (e, audioUrl, letter) => {
  if (e && e.stopPropagation) {
    e.stopPropagation();
  }

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

// ─────────────────────────────────────────────────────────────
// Win Modal
// ─────────────────────────────────────────────────────────────

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

        <div
          style={{
            fontSize: "2rem",
            margin: "8px 0",
          }}
        >
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

// ─────────────────────────────────────────────────────────────
// Lose Modal
// ─────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────
// Pretest Welcome Modal
// ─────────────────────────────────────────────────────────────

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
            style={{
              padding: "12px 36px",
              fontSize: "1.2rem",
            }}
          >
            ابدأ اللعب الآن!
          </button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────

const WordHuntGame = () => {
  // ─────────────────────────────────────────
  // View
  // ─────────────────────────────────────────

  const [view, setView] = useState("levels");

  const [progress, setProgress] = useState(makeDefaultProgress());

  const [progressLoading, setProgressLoading] = useState(true);

  const [showPretestModal, setShowPretestModal] = useState(false);

  // ─────────────────────────────────────────
  // API levels
  // ─────────────────────────────────────────

  const [apiLevels, setApiLevels] = useState([]);

  const [apiLoading, setApiLoading] = useState(true);

  const [apiError, setApiError] = useState(null);

  // ─────────────────────────────────────────
  // Selection
  // ─────────────────────────────────────────

  const [selectedLevelId, setSelectedLevelId] = useState(null);

  const [selectedStageIndex, setSelectedStageIndex] = useState(null);

  // ─────────────────────────────────────────
  // Game
  // ─────────────────────────────────────────

  const [gameQuestions, setGameQuestions] = useState([]);

  const [currentQuestion, setCurrentQuestion] = useState(0);

  const [score, setScore] = useState(0);

  const [lives, setLives] = useState(3);

  const [showFeedback, setShowFeedback] = useState(false);

  const [isCorrect, setIsCorrect] = useState(false);

  const [gameState, setGameState] = useState("playing");

  const [selectedOption, setSelectedOption] = useState(null);

  const [starsEarned, setStarsEarned] = useState(0);

  // ─────────────────────────────────────────
  // Session
  // ─────────────────────────────────────────

  const [sessionId, setSessionId] = useState(null);

  const [startTime, setStartTime] = useState(null);

  const [userId, setUserId] = useState(null);

  // Prevent duplicate progress requests
  const stageCompletionInFlightRef = useRef(false);

  // ─────────────────────────────────────────
  // Fetch Backend Progress
  // ─────────────────────────────────────────

  useEffect(() => {
    let cancelled = false;

    const fetchProgress = async () => {
      const authUser = getAuthUser();

      const currentUserId = authUser?.userId;

      if (!currentUserId) {
        if (!cancelled) {
          setProgress(loadLocalProgressFallback());

          setProgressLoading(false);
        }

        return;
      }

      try {
        setProgressLoading(true);

        const res = await gameProgressAPI.getByUser(currentUserId);

        const progressList = res.data?.data || res.data;

        console.log("WordHunt backend progress:", progressList);

        if (!cancelled) {
          const normalized = normalizeBackendProgress(
            progressList,
            TOTAL_LEVELS,
            STAGES_PER_LEVEL,
          );

          console.log("WordHunt normalized progress:", normalized);

          setProgress(normalized);

          saveProgress(normalized);
        }
      } catch (err) {
        console.error("Failed to fetch backend progress for word_hunt:", err);

        if (!cancelled) {
          setProgress(loadLocalProgressFallback());
        }
      } finally {
        if (!cancelled) {
          setProgressLoading(false);
        }
      }
    };

    fetchProgress();

    return () => {
      cancelled = true;
    };
  }, []);

  // ─────────────────────────────────────────
  // Pretest modal
  // ─────────────────────────────────────────

  useEffect(() => {
    if (
      !progressLoading &&
      progress?.showPretestWelcome &&
      progress?.recommendedLevel > 1
    ) {
      setShowPretestModal(true);
    }
  }, [progress, progressLoading]);

  const dismissPretestModal = () => {
    setShowPretestModal(false);

    setProgress((prev) => {
      const updated = {
        ...prev,
        showPretestWelcome: false,
      };

      saveProgress(updated);

      return updated;
    });
  };

  // ─────────────────────────────────────────
  // Fetch levels
  // ─────────────────────────────────────────

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

    if (authUser?.userId) {
      setUserId(authUser.userId);
    }
  }, []);

  // ─────────────────────────────────────────
  // Level helpers
  // ─────────────────────────────────────────

  const isLevelUnlocked = (levelNum) => {
    return Number(levelNum) <= progress.unlockedLevel;
  };

  const getLevelStagesCompleted = (levelNum) => {
    const stages =
      progress.completedStages[String(levelNum)] || createEmptyStages();

    return stages.filter(Boolean).length;
  };

  const getTotalStarsForLevel = (levelNum) => {
    const stars = progress.stars[String(levelNum)] || createEmptyStars();

    return stars.reduce((a, b) => a + b, 0);
  };

  // ─────────────────────────────────────────
  // Stage helpers
  // ─────────────────────────────────────────

  const isStageUnlocked = (levelNum, stageIndex) => {
    if (stageIndex === 0) {
      return true;
    }

    if (parseInt(levelNum, 10) < progress.unlockedLevel) {
      return true;
    }

    const stages = progress.completedStages[String(levelNum)] || [];

    return stages[stageIndex - 1] === true;
  };

  const getStageStars = (levelNum, stageIndex) => {
    return (progress.stars[String(levelNum)] || [])[stageIndex] || 0;
  };

  // ─────────────────────────────────────────
  // Start Stage
  // ─────────────────────────────────────────

  const startStage = async (levelId, stageIndex) => {
    const numericLevelId = Number(levelId) || 1;

    const apiLevel = apiLevels.find(
      (level) => Number(level.levelNumber) === numericLevelId,
    );

    const normalizedLevelNum =
      Number(apiLevel?.levelNumber ?? numericLevelId) || 1;

    console.log("WordHunt startStage:", {
      levelId,
      numericLevelId,
      normalizedLevelNum,
      stageIndex,
    });

    setSelectedLevelId(normalizedLevelNum);

    setSelectedStageIndex(stageIndex);

    setGameState("loading");

    setView("game");

    setScore(0);

    setLives(3);

    setCurrentQuestion(0);

    setShowFeedback(false);

    setSelectedOption(null);

    setStarsEarned(0);

    stageCompletionInFlightRef.current = false;

    try {
      // Start session
      if (userId) {
        try {
          const sessionRes = await hutGameAPI.startSession(
            userId,
            normalizedLevelNum,
          );

          setSessionId(sessionRes?.data?.data?.sessionId || null);

          setStartTime(Date.now());
        } catch (sessErr) {
          console.warn("Session start error:", sessErr);
        }
      }

      // Fetch words
      const fetches = Array.from({
        length: WORDS_PER_STAGE,
      }).map(() => hutGameAPI.getRandomWord(normalizedLevelNum));

      const responses = await Promise.all(fetches);

      const questions = responses
        .map((res, idx) => {
          const d = res?.data?.data;

          if (!d) {
            return null;
          }

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

            audioBasePath: d.audioBasePath || "",

            audioFormat: d.audioFormat || "",

            optionsAudio: d.optionsAudio || [],
          };
        })
        .filter(Boolean);

      if (questions.length === 0) {
        throw new Error("No questions returned");
      }

      setGameQuestions(questions);

      setGameState("playing");
    } catch (err) {
      console.error("Stage load error:", err);

      setApiError("تعذّر تحميل كلمات المرحلة. أعد المحاولة.");

      setView("stages");
    }
  };

  // ─────────────────────────────────────────
  // Answer Handler
  // ─────────────────────────────────────────

  const handleAnswer = (selectedLetter) => {
    if (gameState !== "playing" || showFeedback) {
      return;
    }

    setSelectedOption(selectedLetter);

    const currentWord = gameQuestions[currentQuestion];

    if (!currentWord) {
      return;
    }

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

  // ─────────────────────────────────────────
  // Stage Completion
  // ─────────────────────────────────────────

  const handleStageComplete = async (finalScore, remainingLives) => {
    if (stageCompletionInFlightRef.current) {
      return;
    }

    if (selectedLevelId === null || selectedStageIndex === null) {
      console.error("Cannot complete WordHunt stage: level/stage missing.");

      return;
    }

    stageCompletionInFlightRef.current = true;

    const won = remainingLives > 0 || finalScore === WORDS_PER_STAGE;

    /*
     * 3 lives = 3 stars
     * 2 lives = 2 stars
     * 1 life  = 1 star
     * 0       = failed
     */
    const stars = won ? Math.min(3, Math.max(1, remainingLives)) : 0;

    setStarsEarned(stars);

    // Finish session
    if (sessionId && startTime) {
      const timeSeconds = Math.floor((Date.now() - startTime) / 1000);

      hutGameAPI.finishSession(sessionId, timeSeconds).catch(() => {});

      setSessionId(null);
      setStartTime(null);
    }

    // Failed stage
    if (!won) {
      setGameState("lost");

      stageCompletionInFlightRef.current = false;

      return;
    }

    const authUser = getAuthUser();

    const currentUserId = authUser?.userId || userId;

    if (!currentUserId) {
      setProgress((prev) => {
        const completedStages = { ...prev.completedStages };
        const starsByLevel = { ...prev.stars };
        const levelStages = [
          ...(completedStages[selectedLevelId] || createEmptyStages()),
        ];
        const levelStars = [
          ...(starsByLevel[selectedLevelId] || createEmptyStars()),
        ];
        levelStages[selectedStageIndex] = true;
        levelStars[selectedStageIndex] = Math.max(
          levelStars[selectedStageIndex] || 0,
          stars,
        );
        completedStages[selectedLevelId] = levelStages;
        starsByLevel[selectedLevelId] = levelStars;

        const unlockedLevel = levelStages.every(Boolean)
          ? Math.min(
              TOTAL_LEVELS,
              Math.max(prev.unlockedLevel, levelNumber + 1),
            )
          : prev.unlockedLevel;
        const updated = {
          ...prev,
          unlockedLevel,
          completedStages,
          stars: starsByLevel,
        };
        saveProgress(updated);
        return updated;
      });

      setGameState("won");

      stageCompletionInFlightRef.current = false;

      return;
    }

    const levelNumber = Number(selectedLevelId);

    const stageNumber = Number(selectedStageIndex) + 1;

    const payload = {
      gameKey: "word_hunt",

      levelNumber,

      stageNumber,

      score: Number(finalScore) || 0,

      starsEarned: Number(stars) || 0,
    };

    try {
      console.log("Completing WordHunt stage:", payload);

      // ───────────────────────────────────────
      // ONLY game progress write
      // ───────────────────────────────────────

      const completeResponse = await gameProgressAPI.completeStage(
        currentUserId,
        payload,
      );

      console.log(
        "WordHunt completeStage response:",
        completeResponse?.data ?? completeResponse,
      );

      // ───────────────────────────────────────
      // Re-read backend progress
      // ───────────────────────────────────────

      const progressResponse = await gameProgressAPI.getByUser(currentUserId);

      const progressList = progressResponse.data?.data || progressResponse.data;

      console.log("WordHunt progress after completion:", progressList);

      const normalized = normalizeBackendProgress(
        progressList,
        TOTAL_LEVELS,
        STAGES_PER_LEVEL,
      );

      console.log("WordHunt normalized progress after completion:", normalized);

      setProgress(normalized);

      saveProgress(normalized);

      // ───────────────────────────────────────
      // Award XP
      // ───────────────────────────────────────

      try {
        const xpEarned = Number(finalScore) * 10;

        const xpResponse = await profileAPI.awardXP(
          currentUserId,
          xpEarned,
          true,
        );

        console.log(
          "awardXP response (WordHunt):",
          xpResponse?.data ?? xpResponse,
        );

        try {
          recordXpAttempt(
            {
              userId: currentUserId,

              xp: xpEarned,

              sessionCompleted: true,
            },

            xpResponse?.data ?? xpResponse,
          );
        } catch (e) {
          console.warn("Failed to record XP attempt:", e);
        }
      } catch (xpErr) {
        console.warn("Could not award XP:", xpErr);
      }

      setGameState("won");
    } catch (err) {
      console.error("Failed to complete WordHunt stage on backend:", err);

      console.error("Status:", err?.response?.status);

      console.error("Response:", err?.response?.data);

      console.error("Request body:", err?.config?.data);

      /*
       * Do not fabricate local progress
       * when backend rejects completion.
       */
      setGameState("won");
    } finally {
      stageCompletionInFlightRef.current = false;
    }
  };

  // ─────────────────────────────────────────
  // Button class
  // ─────────────────────────────────────────

  const getButtonClass = (letter) => {
    if (selectedOption !== letter) {
      return "wh-option-btn wh-opt-default";
    }

    return isCorrect
      ? "wh-option-btn wh-opt-correct"
      : "wh-option-btn wh-opt-wrong";
  };

  // ─────────────────────────────────────────
  // Continue
  // ─────────────────────────────────────────

  const handleContinue = () => {
    const nextStage = selectedStageIndex + 1;

    if (
      nextStage < STAGES_PER_LEVEL &&
      isStageUnlocked(selectedLevelId, nextStage)
    ) {
      startStage(selectedLevelId, nextStage);
    } else {
      setView("stages");
      setGameState("playing");
    }
  };

  // ─────────────────────────────────────────
  // Replay
  // ─────────────────────────────────────────

  const handleReplay = () => {
    startStage(selectedLevelId, selectedStageIndex);
  };

  // ─────────────────────────────────────────
  // LEVELS loading
  // ─────────────────────────────────────────

  if (view === "levels" && (apiLoading || progressLoading)) {
    return (
      <div className="wh-full-page">
        <div className="wh-wrapper">
          <div className="wh-loading-container">
            <div className="wh-loading-spinner">⏳</div>

            <p
              style={{
                color: "#fef3c7",
                fontWeight: 700,
              }}
            >
              جارٍ تحميل المستويات والتقدم...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────
  // LEVELS error
  // ─────────────────────────────────────────

  if (view === "levels" && apiError) {
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

  // ═══════════════════════════════════════════════════════════
  // VIEW: LEVELS
  // ═══════════════════════════════════════════════════════════

  if (view === "levels") {
    const levelCards =
      apiLevels.length > 0
        ? apiLevels
        : Array.from(
            {
              length: TOTAL_LEVELS,
            },
            (_, i) => ({
              levelNumber: i + 1,

              description: `المستوى ${i + 1}`,
            }),
          );

    return (
      <div className="wh-full-page">
        {showPretestModal && (
          <PretestWelcomeModal
            unlockedLevel={progress.recommendedLevel}
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
          <div className="wh-map-title-container">
            <h1 className="wh-map-title">🏠 كوخ الكلمات</h1>

            <p className="wh-map-subtitle">اختر مستوى وابدأ رحلتك!</p>
          </div>

          <div className="wh-levels-grid">
            {levelCards.map((level, idx) => {
              const levelNum = level.levelNumber ?? idx + 1;

              const isUnlocked = isLevelUnlocked(levelNum);

              const completed = getLevelStagesCompleted(levelNum);

              const totalStars = getTotalStarsForLevel(levelNum);

              const pct = Math.round((completed / STAGES_PER_LEVEL) * 100);

              const isRecommended = levelNum === progress.recommendedLevel;

              return (
                <div
                  key={levelNum}
                  className={`wh-level-card${
                    !isUnlocked ? " wh-level-card-locked" : ""
                  }`}
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
                    if (!isUnlocked) {
                      return;
                    }

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
                        style={{
                          width: `${pct}%`,
                        }}
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
    const levelNum = Number(selectedLevelId) || 1;

    const levelInfo = apiLevels.find(
      (l) => Number(l.levelNumber) === levelNum,
    ) || {
      description: `المستوى ${levelNum}`,
    };

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

          <div className="wh-stages-grid">
            {Array.from(
              {
                length: STAGES_PER_LEVEL,
              },
              (_, stageIdx) => {
                const unlocked = isStageUnlocked(levelNum, stageIdx);

                const stars = getStageStars(levelNum, stageIdx);

                const isRecommended =
                  levelNum === progress.recommendedLevel &&
                  stageIdx === progress.recommendedStage - 1;

                return (
                  <div
                    key={stageIdx}
                    className="wh-stage-node-wrapper"
                    style={{
                      position: "relative",
                    }}
                  >
                    {isRecommended && (
                      <div
                        style={{
                          position: "absolute",
                          top: "-22px",
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
                          animation: "bounce 1.5s infinite",
                        }}
                      >
                        بداية المسار 🚀
                      </div>
                    )}

                    <div
                      className={`wh-stage-node${
                        !unlocked ? " wh-stage-node-locked" : ""
                      }`}
                      style={
                        isRecommended
                          ? {
                              boxShadow: "0 0 15px #ffd700, 0 0 5px #ffd700",

                              border: "3px solid #ffd700",
                            }
                          : {}
                      }
                      onClick={() => {
                        if (unlocked) {
                          startStage(levelNum, stageIdx);
                        }
                      }}
                    >
                      {unlocked ? stageIdx + 1 : "🔒"}
                    </div>

                    <div className="wh-stage-label">المرحلة {stageIdx + 1}</div>

                    <div className="wh-stage-stars">
                      {[1, 2, 3].map((s) => (
                        <span
                          key={s}
                          className={`wh-star ${
                            s <= stars ? "wh-star-active" : "wh-star-inactive"
                          }`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                );
              },
            )}
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // GAME: LOADING
  // ═══════════════════════════════════════════════════════════

  if (gameState === "loading") {
    return (
      <div className="wh-full-page">
        <div className="wh-wrapper">
          <div className="wh-loading-container">
            <div className="wh-loading-spinner">⏳</div>

            <p
              style={{
                color: "#fef3c7",
                fontWeight: 700,
              }}
            >
              جارٍ تحضير الكلمات...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // GAME: WON
  // ═══════════════════════════════════════════════════════════

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

  // ═══════════════════════════════════════════════════════════
  // GAME: LOST
  // ═══════════════════════════════════════════════════════════

  if (gameState === "lost") {
    return <LoseModal score={score} onReplay={handleReplay} />;
  }

  // ═══════════════════════════════════════════════════════════
  // GAME: PLAYING
  // ═══════════════════════════════════════════════════════════

  const currentData = gameQuestions[currentQuestion];

  const progressPercentage =
    gameQuestions.length > 0
      ? (currentQuestion / gameQuestions.length) * 100
      : 0;

  if (!currentData) {
    return null;
  }

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

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: "4px",
              }}
            >
              {[...Array(3)].map((_, i) => (
                <Heart
                  key={i}
                  size={24}
                  fill={i < lives ? "#ef4444" : "#4b5563"}
                  color={i < lives ? "#ef4444" : "#4b5563"}
                  style={{
                    opacity: i < lives ? 1 : 0.3,
                  }}
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
              style={{
                width: `${progressPercentage}%`,
              }}
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
              <div
                style={{
                  textAlign: "center",
                  marginBottom: "20px",
                }}
              >
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

              if (audioFileName) {
                if (
                  audioFileName.includes("/") ||
                  audioFileName.includes(".")
                ) {
                  audioUrl = audioFileName;
                } else {
                  let basePath = currentData.audioBasePath || "";

                  let format = currentData.audioFormat || "";

                  if (basePath && !basePath.endsWith("/")) {
                    basePath += "/";
                  }

                  if (format && !format.startsWith(".")) {
                    format = "." + format;
                  }

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

                if (
                  audioUrl &&
                  !audioUrl.startsWith("http") &&
                  backendBaseUrl
                ) {
                  const cleanBaseUrl = backendBaseUrl.endsWith("/")
                    ? backendBaseUrl.slice(0, -1)
                    : backendBaseUrl;

                  audioUrl = `${cleanBaseUrl}${audioUrl}`;
                }
              }

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
                      if (!showFeedback && selectedOption === null) {
                        handleAnswer(letter);
                      }
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
                    style={{
                      width: "2px",
                      background: "rgba(0,0,0,0.1)",
                    }}
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

          {/* Feedback */}

          {showFeedback && (
            <div className={`wh-feedback ${isCorrect ? "success" : "error"}`}>
              {isCorrect ? (
                <>
                  <CheckCircle
                    size={80}
                    color="#22c55e"
                    style={{
                      marginBottom: "1rem",
                    }}
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
                    style={{
                      marginBottom: "1rem",
                    }}
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

                  <p
                    style={{
                      color: "#dc2626",
                      fontWeight: "bold",
                    }}
                  >
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
