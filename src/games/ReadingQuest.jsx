// src/games/ReadingQuest.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/ReadingQuest.module.css";
import { WinModal, LoseModal } from "../components/WinLose";
import { BoatSVG, TornadoSVG } from "../components/GameIcons";
import { shalalAPI, profileAPI } from "../server/endpoints";
import { getAuthUser } from "../server/auth";
import { SHALAL_DATA } from "../data/shalal_stories";
import { useTranslation } from "react-i18next";

const defaultProgress = {
  unlockedLevel: 1,
  completedStages: {
    "1": [false, false, false, false, false],
    "2": [false, false, false, false, false],
    "3": [false, false, false, false, false],
    "4": [false, false, false, false, false]
  },
  stars: {
    "1": [0, 0, 0, 0, 0],
    "2": [0, 0, 0, 0, 0],
    "3": [0, 0, 0, 0, 0],
    "4": [0, 0, 0, 0, 0]
  }
};

const LEVEL_METADATA_EN = {
  "1": {
    name: "Level 1: Basics",
    focus: "Basic reading comprehension and short sentences"
  },
  "2": {
    name: "Level 2: Daily Life",
    focus: "Reading about daily routines, school, and activities"
  },
  "3": {
    name: "Level 3: Hobbies & Interests",
    focus: "Reading about sports, instruments, and creative pursuits"
  },
  "4": {
    name: "Level 4: Science & Nature",
    focus: "Complex stories about ecosystems, space, and anatomy"
  }
};

const LEVEL_METADATA_AR = {
  "1": {
    name: "المستوى 1: الأساسيات",
    focus: "فهم المقروء الأساسي والجمل البسيطة"
  },
  "2": {
    name: "المستوى 2: الحياة اليومية",
    focus: "قراءة حول الروتين اليومي والمدرسة والأنشطة"
  },
  "3": {
    name: "المستوى 3: الهوايات والاهتمامات",
    focus: "قراءة حول الرياضة والآلات الموسيقية والاهتمامات الإبداعية"
  },
  "4": {
    name: "المستوى 4: العلوم والطبيعة",
    focus: "قصص علمية حول الأنظمة البيئية والفضاء والجسد"
  }
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
      const stored = localStorage.getItem("reading_quest_progress");
      if (stored) {
        const parsed = JSON.parse(stored);
        const newProgress = { ...defaultProgress, ...parsed };
        newProgress.completedStages = { ...defaultProgress.completedStages, ...parsed.completedStages };
        newProgress.stars = { ...defaultProgress.stars, ...parsed.stars };
        return newProgress;
      }
    } catch (e) {
      console.error("Failed to parse progress", e);
    }
    return defaultProgress;
  });

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
    const isStageUnlocked = stageIndex === 0 || progress.completedStages[selectedLevelId]?.[stageIndex - 1];
    if (!isStageUnlocked) return;

    setSelectedStageIndex(stageIndex);

    const levelData = SHALAL_DATA[parseInt(selectedLevelId, 10) - 1];
    if (!levelData || !levelData.questions) return;

    const totalQuestions = levelData.questions;
    const numStages = 5;
    const stageSize = Math.ceil(totalQuestions.length / numStages);

    let questions = totalQuestions.slice(stageIndex * stageSize, (stageIndex + 1) * stageSize);
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

      const currentLevelStages = [...(completedStages[selectedLevelId] || [false, false, false, false, false])];
      currentLevelStages[selectedStageIndex] = true;
      completedStages[selectedLevelId] = currentLevelStages;

      const currentLevelStars = [...(stars[selectedLevelId] || [0, 0, 0, 0, 0])];
      currentLevelStars[selectedStageIndex] = Math.max(currentLevelStars[selectedStageIndex] || 0, earnedStars);
      stars[selectedLevelId] = currentLevelStars;

      // Check if all 5 stages of the current level are completed
      const allCompleted = currentLevelStages.every(Boolean);
      let unlockedLevel = prev.unlockedLevel;
      if (allCompleted) {
        unlockedLevel = Math.min(4, Math.max(unlockedLevel, parseInt(selectedLevelId, 10) + 1));
      }

      const updatedProgress = {
        ...prev,
        unlockedLevel,
        completedStages,
        stars
      };

      localStorage.setItem("reading_quest_progress", JSON.stringify(updatedProgress));
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
            await profileAPI.awardXP(userId, xpEarned, true);
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
      console.warn("TTS not supported");
    }
  };

  const isRTL = i18n.language === "ar";
  const LEVEL_META = isRTL ? LEVEL_METADATA_AR : LEVEL_METADATA_EN;

  // ── Render ─────────────────────────────────────────────────────────────────

  // ──────────────── LEVEL SELECTION VIEW ────────────────
  if (view === "levels") {
    const levelIds = Object.keys(LEVEL_META); // ["1","2","3","4"]
    return (
      <div className={styles.gameContainer}>
        <nav className={styles.headerNav}>
          <div className={styles.scoreBoard}>📖 {t("readingQuest.title", "Reading Quest")}</div>
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
              {t("readingQuest.selectLevelSub", "Complete all stages to unlock the next level")}
            </p>
          </div>

          <div className={styles.levelsGrid}>
            {levelIds.map((id) => {
              const meta = LEVEL_META[id];
              const num = parseInt(id, 10);
              const isLocked = num > progress.unlockedLevel;
              const completedCount = (progress.completedStages[id] || []).filter(Boolean).length;
              const totalStages = 5;
              const pct = Math.round((completedCount / totalStages) * 100);

              return (
                <div
                  key={id}
                  className={`${styles.levelCard} ${isLocked ? styles.levelCardLocked : ""}`}
                  onClick={() => handleSelectLevel(id)}
                >
                  {isLocked && <div className={styles.lockOverlay}>🔒</div>}
                  <div className={styles.levelCardContent}>
                    <span className={styles.levelNum}>
                      {t("readingQuest.level", "Level")} {num}
                    </span>
                    <h3 className={styles.levelName}>{meta.name}</h3>
                    <p className={styles.levelFocus}>{meta.focus}</p>
                  </div>
                  <div className={styles.levelFooter}>
                    <div className={styles.levelProgressText}>
                      <span>{completedCount} / {totalStages}</span>
                      <span>{pct}%</span>
                    </div>
                    <div className={styles.progressBarBg}>
                      <div className={styles.progressBarFill} style={{ width: `${pct}%` }} />
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
    const stageCompleted = progress.completedStages[selectedLevelId] || [false, false, false, false, false];

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
            <button className={styles.backBtn} onClick={() => setView("levels")}>
              ← {t("readingQuest.backToLevels", "Back to Levels")}
            </button>
          </div>

          <div className={styles.stagesGrid}>
            {[0, 1, 2, 3, 4].map((stageIdx) => {
              const isUnlocked = stageIdx === 0 || stageCompleted[stageIdx - 1];
              const isComplete = stageCompleted[stageIdx];
              const starCount = stageStars[stageIdx] || 0;

              return (
                <div key={stageIdx} className={styles.stageNodeWrapper}>
                  <div
                    className={`${styles.stageNode} ${!isUnlocked ? styles.stageNodeLocked : ""}`}
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
        <div className={styles.scoreBoard}>⭐ {t("readingQuest.score", "Score")}: {score}</div>
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
                {q?.question || t("readingQuest.defaultQuestion", "What did you read?")}
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
                    ? t("readingQuest.correctFeedback", "Great! Boat is steady. 🚢")
                    : t("readingQuest.wrongFeedback", "Oh no! Drifting closer! 🌊")}
                </div>
              )}
            </div>
          )}
        </div>

        <div className={styles.progressText}>
          {t("readingQuest.question", "Question")} {currentQuestionIndex + 1} / {stageQuestions.length}
        </div>
      </div>

      <div className={styles.riverFooter}>
        <div className={styles.dangerLabel}>⚠️ {t("readingQuest.dangerZone", "DANGER ZONE")}</div>
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
