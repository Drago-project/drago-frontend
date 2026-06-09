// src/games/TombPuzzle.jsx
import { useState, useEffect, useRef } from "react";
import style from "../styles/TombPuzzle.module.css";
import { fallbackQuestions } from "../data/tombPuzzleFallback";

// ─── HF Space data source ─────────────────────────────────────────────────────
const HF_QUESTIONS_URL =
  "https://huggingface.co/spaces/T1a2T3a4/tartiiiiib/raw/main/generated_questions.json";

// ─── Constants ────────────────────────────────────────────────────────────────
const TOTAL_LEVELS   = 6;
const STAGES_PER_LEVEL = 5;
const QUESTIONS_PER_STAGE = 12; // questions shown per stage session
const STORAGE_KEY    = "tomb_puzzle_progress";

// ─── Level Metadata ───────────────────────────────────────────────────────────
const LEVEL_META = {
  1: { name: "المستوى الأول",  focus: "جمل قصيرة ثلاثية الكلمات",       icon: "🏺", color: "#c0a060" },
  2: { name: "المستوى الثاني", focus: "جمل رباعية الكلمات",              icon: "📜", color: "#c06020" },
  3: { name: "المستوى الثالث", focus: "جمل بجملة فعلية + مضاف إليه",     icon: "🗿", color: "#8060a0" },
  4: { name: "المستوى الرابع", focus: "جمل مكونة من خمس كلمات",          icon: "⚱️", color: "#206080" },
  5: { name: "المستوى الخامس", focus: "جمل طويلة مع ظرف زمان",           icon: "👁️", color: "#208040" },
  6: { name: "المستوى السادس", focus: "جمل معقدة ومتعددة العناصر",       icon: "👑", color: "#a04020" },
};

const categoryMap = {
  school:        "المدرسة والتعلم 🏫",
  daily_life:    "الحياة اليومية ☀️",
  food:          "الطعام والغذاء 🍎",
  family:        "العائلة 👨‍👩‍👧‍👦",
  animals:       "الحيوانات 🐾",
  sports:        "الرياضة ⚽",
  transportation:"وسائل النقل 🚗",
  nature:        "الطبيعة 🌲",
  friends:       "الأصدقاء 🤝",
  home:          "المنزل 🏠",
  community:     "المجتمع 👥",
  basic:         "الجمل الأساسية 💬",
};

// ─── Default progress ─────────────────────────────────────────────────────────
const makeDefaultProgress = () => ({
  unlockedLevel: 1,
  completedStages: Object.fromEntries(
    Array.from({ length: TOTAL_LEVELS }, (_, i) => [
      String(i + 1),
      Array(STAGES_PER_LEVEL).fill(false),
    ])
  ),
  stars: Object.fromEntries(
    Array.from({ length: TOTAL_LEVELS }, (_, i) => [
      String(i + 1),
      Array(STAGES_PER_LEVEL).fill(0),
    ])
  ),
});

const loadProgress = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      const def = makeDefaultProgress();
      return {
        ...def,
        ...parsed,
        completedStages: { ...def.completedStages, ...parsed.completedStages },
        stars: { ...def.stars, ...parsed.stars },
      };
    }
  } catch {}
  return makeDefaultProgress();
};

const saveProgress = (prog) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(prog)); } catch {}
};

// ─── Star rating logic (mirrors game_engine.py) ───────────────────────────────
function calcStars(correct, total) {
  if (total === 0) return 0;
  const pct = (correct / total) * 100;
  if (pct >= 90) return 3;
  if (pct >= 75) return 2;
  if (pct >= 50) return 1;
  return 0;
}

// ─── Sound helpers ────────────────────────────────────────────────────────────
function playSound(type) {
  const map = {
    correct:  "/sounds/correct.mp3",
    wrong:    "/sounds/wrong.mp3",
    win:      "/sounds/win.mp3",
    gameover: "/sounds/tomb_lose.mp3",
    click:    "https://s3.amazonaws.com/freecodecamp/drums/Heater-1.mp3",
    pop:      "https://s3.amazonaws.com/freecodecamp/drums/Dsc_Oh.mp3",
    magic:    "https://s3.amazonaws.com/freecodecamp/drums/Give_us_a_light.mp3",
    chest:    "https://s3.amazonaws.com/freecodecamp/drums/Cev_H2.mp3",
  };
  const src = map[type];
  if (!src) return;
  const audio = new Audio(src);
  audio.volume = 0.4;
  audio.play().catch(() => {});
}

// ─── Artifacts (treasure collection) ─────────────────────────────────────────
const allArtifacts = [
  { id: 1, name: "القناع الذهبي",   icon: "👑" },
  { id: 2, name: "الجعران المقدس",  icon: "🪲" },
  { id: 3, name: "عين حورس",        icon: "👁️" },
  { id: 4, name: "مفتاح الحياة",    icon: "☥" },
  { id: 5, name: "تمثال باستت",     icon: "🐈" },
  { id: 6, name: "رمح حورس",        icon: "⚡" },
];

// ─── Main Component ───────────────────────────────────────────────────────────
function TombPuzzle() {
  // ── View state: "levels" | "stages" | "game" | "collection" ──────────────
  const [view, setView]               = useState("levels");
  const [progress, setProgress]       = useState(loadProgress);

  // ── HF data ───────────────────────────────────────────────────────────────
  // allQuestions grouped by level: { "1": [...], "2": [...], ... }
  const [questionsByLevel, setQuestionsByLevel] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError]     = useState(null);

  // ── Selection ─────────────────────────────────────────────────────────────
  const [selectedLevel, setSelectedLevel]       = useState(null);
  const [selectedStageIndex, setSelectedStageIndex] = useState(null);

  // ── Game ──────────────────────────────────────────────────────────────────
  const [stageQuestions, setStageQuestions]     = useState([]);
  const [questionIndex, setQuestionIndex]       = useState(0);
  const [shuffledWords, setShuffledWords]       = useState([]);
  const [userAnswer, setUserAnswer]             = useState([]);
  const [lives, setLives]                       = useState(3);
  const [correctCount, setCorrectCount]         = useState(0);
  const [hints, setHints]                       = useState(3);
  const [pharaohMood, setPharaohMood]           = useState("neutral");
  const [notification, setNotification]         = useState({ show: false, message: "", type: "" });
  const [secretInfo, setSecretInfo]             = useState({ show: false, text: "" });
  const [stageResult, setStageResult]           = useState(null); // { stars, correct, total, passed }

  // ── Collection / Treasure ─────────────────────────────────────────────────
  const [myCollection, setMyCollection]         = useState([]);
  const [reward, setReward]                     = useState(null);
  const [chestOpened, setChestOpened]           = useState(false);

  // ── Music ─────────────────────────────────────────────────────────────────
  const [isMusicPlaying, setIsMusicPlaying]     = useState(false);
  const musicRef = useRef(new Audio("/sounds/tomb-bg.mp3"));

  // ─── Load data from HF space on mount ──────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        setDataLoading(true);
        setDataError(null);
        const res = await fetch(HF_QUESTIONS_URL);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        // Group by level
        const grouped = {};
        for (let l = 1; l <= TOTAL_LEVELS; l++) grouped[String(l)] = [];
        for (const q of data) {
          const key = String(q.level ?? 1);
          if (!grouped[key]) grouped[key] = [];
          grouped[key].push(q);
        }
        setQuestionsByLevel(grouped);
      } catch (err) {
        console.warn("HF fetch failed, using fallback:", err);
        // Build grouped fallback
        const grouped = {};
        for (let l = 1; l <= TOTAL_LEVELS; l++) grouped[String(l)] = [];
        for (const q of fallbackQuestions) {
          // Distribute fallback evenly across levels
          const key = String(((fallbackQuestions.indexOf(q) % TOTAL_LEVELS) + 1));
          grouped[key].push({ ...q, level: parseInt(key) });
        }
        setQuestionsByLevel(grouped);
        setDataError("تعذّر الاتصال بالخادم. يتم استخدام البيانات المحلية.");
      } finally {
        setDataLoading(false);
      }
    })();
  }, []);

  // ── Load collection from localStorage ─────────────────────────────────────
  useEffect(() => {
    try {
      const saved = localStorage.getItem("pharaoh_treasures");
      if (saved) {
        const parsed = JSON.parse(saved);
        const valid  = parsed.filter(s => allArtifacts.some(a => a.id === s.id));
        setMyCollection(valid);
      }
    } catch {}
  }, []);

  // ── Music ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    musicRef.current.loop   = true;
    musicRef.current.volume = 0.5;
    if (isMusicPlaying) musicRef.current.play().catch(() => {});
    else musicRef.current.pause();
    return () => musicRef.current.pause();
  }, [isMusicPlaying]);

  // ── Reset words when question changes ──────────────────────────────────────
  useEffect(() => {
    if (view === "game" && stageQuestions.length > 0 && questionIndex < stageQuestions.length) {
      const q = stageQuestions[questionIndex];
      const words = q.sentence.trim().split(/\s+/);
      setShuffledWords([...words].sort(() => Math.random() - 0.5));
      setUserAnswer([]);
      setPharaohMood("neutral");
      setSecretInfo({ show: false, text: "" });
    }
  }, [view, questionIndex, stageQuestions]);

  // ─── Progress helpers ────────────────────────────────────────────────────────
  const isLevelUnlocked = (levelNum) => levelNum <= progress.unlockedLevel;

  const getLevelProgress = (levelNum) => {
    const key    = String(levelNum);
    const stages = progress.completedStages[key] || [];
    const done   = stages.filter(Boolean).length;
    const total  = STAGES_PER_LEVEL;
    const stars  = (progress.stars[key] || []).reduce((a, b) => a + b, 0);
    return { done, total, pct: Math.round((done / total) * 100), stars };
  };

  const isStageUnlocked = (levelNum, stageIdx) => {
    if (stageIdx === 0) return true;
    return (progress.completedStages[String(levelNum)] || [])[stageIdx - 1] === true;
  };

  const getStageStars = (levelNum, stageIdx) =>
    (progress.stars[String(levelNum)] || [])[stageIdx] || 0;

  // ─── Stage launcher ───────────────────────────────────────────────────────────
  const launchStage = (levelNum, stageIdx) => {
    if (!questionsByLevel) return;
    const pool = questionsByLevel[String(levelNum)] || [];
    if (pool.length === 0) return;

    // Shuffle pool, slice stage
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const size     = Math.ceil(pool.length / STAGES_PER_LEVEL);
    let slice = shuffled.slice(stageIdx * size, (stageIdx + 1) * size);
    // Ensure we always have at least QUESTIONS_PER_STAGE items (wrap around)
    while (slice.length < QUESTIONS_PER_STAGE) {
      slice = [...slice, ...shuffled.slice(0, QUESTIONS_PER_STAGE - slice.length)];
    }
    const questions = slice.slice(0, QUESTIONS_PER_STAGE);

    setSelectedLevel(levelNum);
    setSelectedStageIndex(stageIdx);
    setStageQuestions(questions);
    setQuestionIndex(0);
    setLives(3);
    setCorrectCount(0);
    setHints(3);
    setStageResult(null);
    setChestOpened(false);
    setReward(null);
    setView("game");
    if (!isMusicPlaying) setIsMusicPlaying(true);
  };

  // ─── Game logic ───────────────────────────────────────────────────────────────
  const showToast = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "" }), 2000);
  };

  const handleWordClick = (word) => {
    if (notification.show || secretInfo.show) return;
    playSound("click");
    const newAnswer   = [...userAnswer, word];
    const newShuffled = [...shuffledWords];
    const idx = newShuffled.indexOf(word);
    if (idx > -1) newShuffled.splice(idx, 1);
    setUserAnswer(newAnswer);
    setShuffledWords(newShuffled);
    if (newAnswer.length === stageQuestions[questionIndex].sentence.trim().split(/\s+/).length) {
      checkAnswer(newAnswer);
    }
  };

  const handleReturnWord = (word, idx) => {
    if (notification.show || secretInfo.show) return;
    playSound("click");
    const newAnswer = [...userAnswer];
    newAnswer.splice(idx, 1);
    setUserAnswer(newAnswer);
    setShuffledWords([...shuffledWords, word]);
  };

  const checkAnswer = (answer) => {
    const q          = stageQuestions[questionIndex];
    const formatted  = answer.map(w => w.trim()).join(" ");
    const isCorrect  = q.accepted.some(a => a.trim() === formatted);

    if (isCorrect) {
      setPharaohMood("happy");
      playSound("correct");
      const newCorrect = correctCount + 1;
      setCorrectCount(newCorrect);
      setTimeout(() => {
        playSound("pop");
        const catAr = categoryMap[q.category] || q.category;
        setSecretInfo({
          show: true,
          text: `أحسنت! جملة صحيحة من موضوع ${catAr}. استمر في النجاح! ✨`,
        });
      }, 400);
    } else {
      setPharaohMood("angry");
      playSound("wrong");
      const newLives = lives - 1;
      if (newLives <= 0) {
        setLives(0);
        setTimeout(() => finishStage(correctCount, stageQuestions.length, true), 500);
      } else {
        setLives(newLives);
        showToast("❌ ترتيب خاطئ! خسرت قلب 💔", "error");
        setTimeout(() => {
          const orig = stageQuestions[questionIndex].sentence.trim().split(/\s+/);
          setShuffledWords([...orig].sort(() => Math.random() - 0.5));
          setUserAnswer([]);
          setPharaohMood("neutral");
        }, 1000);
      }
    }
  };

  const handleNextQuestion = () => {
    setSecretInfo({ show: false, text: "" });
    const nextIdx = questionIndex + 1;
    if (nextIdx < stageQuestions.length) {
      setQuestionIndex(nextIdx);
    } else {
      finishStage(correctCount, stageQuestions.length, false);
    }
  };

  const finishStage = (correct, total, lostAllLives) => {
    const stars  = lostAllLives ? 0 : calcStars(correct, total);
    const passed = stars > 0;
    const result = { stars, correct, total, passed };
    setStageResult(result);
    playSound(passed ? "win" : "gameover");

    if (passed) {
      // Update progress
      setProgress(prev => {
        const key     = String(selectedLevel);
        const newComp = { ...prev.completedStages };
        const newStar = { ...prev.stars };
        const stages  = [...(newComp[key] || Array(STAGES_PER_LEVEL).fill(false))];
        const starArr = [...(newStar[key]  || Array(STAGES_PER_LEVEL).fill(0))];
        stages[selectedStageIndex]  = true;
        starArr[selectedStageIndex] = Math.max(starArr[selectedStageIndex], stars);
        newComp[key] = stages;
        newStar[key] = starArr;

        const allDone     = stages.every(Boolean);
        const newUnlocked = allDone
          ? Math.min(TOTAL_LEVELS, Math.max(prev.unlockedLevel, selectedLevel + 1))
          : prev.unlockedLevel;

        const updated = { ...prev, unlockedLevel: newUnlocked, completedStages: newComp, stars: newStar };
        saveProgress(updated);
        return updated;
      });
    }
  };

  const useHint = () => {
    if (hints <= 0 || notification.show || secretInfo.show) return;
    let firstError = 0;
    const correctWords = stageQuestions[questionIndex].sentence.trim().split(/\s+/);
    while (firstError < userAnswer.length && userAnswer[firstError] === correctWords[firstError]) {
      firstError++;
    }
    const needed = correctWords[firstError];
    if (!needed) return;
    playSound("magic");
    setHints(hints - 1);

    const kept    = userAnswer.slice(0, firstError);
    const removed = userAnswer.slice(firstError);
    const newAns  = [...kept, needed];
    setUserAnswer(newAns);

    const newShuf = [...shuffledWords, ...removed];
    const rmIdx   = newShuf.indexOf(needed);
    if (rmIdx > -1) newShuf.splice(rmIdx, 1);
    setShuffledWords(newShuf);

    if (newAns.length === correctWords.length) checkAnswer(newAns);
  };

  // ── Treasure chest ────────────────────────────────────────────────────────
  const openChest = () => {
    if (chestOpened) return;
    playSound("chest");
    playSound("win");
    setChestOpened(true);
    const artifact = allArtifacts[Math.floor(Math.random() * allArtifacts.length)];
    setReward(artifact);
    if (!myCollection.find(a => a.id === artifact.id)) {
      const newColl = [...myCollection, artifact];
      setMyCollection(newColl);
      localStorage.setItem("pharaoh_treasures", JSON.stringify(newColl));
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className={style["game-container"]}>
      {/* Music toggle */}
      <button className={style["music-toggle"]} onClick={() => setIsMusicPlaying(p => !p)}>
        {isMusicPlaying ? "🔊" : "🔇"}
      </button>

      {/* Secret info overlay (correct answer) */}
      {secretInfo.show && (
        <div className={style["secret-overlay"]}>
          <div className={style["secret-scroll"]}>
            <h2>📜 بردية سرية اكتشفتها!</h2>
            <p>{secretInfo.text}</p>
            <button className={style["btn-next"]} onClick={handleNextQuestion}>
              {questionIndex + 1 < stageQuestions.length ? "السؤال التالي ➡️" : "عرض النتيجة 🏆"}
            </button>
          </div>
        </div>
      )}

      {/* Toast notification */}
      {notification.show && (
        <div className={`${style["notification-popup"]} ${style[notification.type]}`}>
          {notification.message}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════
          VIEW: LOADING
      ════════════════════════════════════════════════════════ */}
      {dataLoading && (
        <div className={style["start-screen"]}>
          <div style={{ fontSize: "60px", animation: "pulse 1s infinite" }}>⏳</div>
          <h2 style={{ color: "#ffd700", marginTop: "20px" }}>جارٍ فتح المقبرة...</h2>
          <p style={{ color: "#d4af37", opacity: 0.8 }}>تحميل الألغاز من الخادم</p>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════
          VIEW: LEVELS
      ════════════════════════════════════════════════════════ */}
      {!dataLoading && view === "levels" && (
        <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: "20px", padding: "20px", boxSizing: "border-box", overflowY: "auto", maxHeight: "100vh" }}>
          {/* Header */}
          <div style={{ textAlign: "center", background: "rgba(0,0,0,0.55)", border: "2px solid #c0a060", borderRadius: "20px", padding: "18px 36px", backdropFilter: "blur(8px)", animation: "fadeIn 0.5s ease" }}>
            <h1 style={{ color: "#ffd700", margin: 0, fontSize: "28px", textShadow: "0 0 16px #c0a060" }}>🏺 مقبرة الأسرار 🏺</h1>
            <p style={{ color: "#d4af37", margin: "6px 0 0", fontSize: "14px" }}>اختر مستوى وابدأ رحلتك داخل المقبرة!</p>
          </div>

          {/* Error notice */}
          {dataError && (
            <div style={{ background: "rgba(180,60,0,0.5)", border: "1px solid #c07030", borderRadius: "12px", padding: "10px 20px", color: "#ffd080", fontSize: "13px", maxWidth: "480px", textAlign: "center" }}>
              ⚠️ {dataError}
            </div>
          )}

          {/* Level cards grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "20px", width: "100%", maxWidth: "700px", paddingBottom: "30px" }}>
            {Array.from({ length: TOTAL_LEVELS }, (_, i) => i + 1).map(levelNum => {
              const meta      = LEVEL_META[levelNum];
              const unlocked  = isLevelUnlocked(levelNum);
              const { done, pct, stars } = getLevelProgress(levelNum);

              return (
                <div
                  key={levelNum}
                  onClick={() => { if (unlocked) { setSelectedLevel(levelNum); setView("stages"); } }}
                  style={{
                    background: unlocked
                      ? `linear-gradient(145deg, rgba(${hexToRgb(meta.color)},0.8), rgba(0,0,0,0.65))`
                      : "rgba(30,20,10,0.75)",
                    border: `2px solid ${unlocked ? meta.color : "#555"}`,
                    borderRadius: "20px",
                    padding: "22px 18px",
                    cursor: unlocked ? "pointer" : "not-allowed",
                    opacity: unlocked ? 1 : 0.6,
                    filter: unlocked ? "none" : "grayscale(70%)",
                    transition: "all 0.3s ease",
                    backdropFilter: "blur(8px)",
                    direction: "rtl",
                    position: "relative",
                    overflow: "hidden",
                    boxShadow: unlocked ? `0 8px 24px rgba(${hexToRgb(meta.color)},0.3)` : "none",
                  }}
                  onMouseEnter={e => { if (unlocked) e.currentTarget.style.transform = "translateY(-6px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "none"; }}
                >
                  {!unlocked && (
                    <div style={{ position: "absolute", top: "12px", left: "12px", fontSize: "20px", background: "rgba(0,0,0,0.4)", borderRadius: "50%", width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center" }}>🔒</div>
                  )}
                  <div style={{ color: meta.color, fontSize: "13px", fontWeight: 800, letterSpacing: "1px" }}>
                    {meta.icon} المستوى {levelNum}
                  </div>
                  <h3 style={{ color: "#fff", margin: "8px 0 4px", fontSize: "16px", fontWeight: 800 }}>{meta.name}</h3>
                  <p style={{ color: "#d4af37", margin: 0, fontSize: "12px", fontStyle: "italic" }}>{meta.focus}</p>
                  <div style={{ marginTop: "14px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", color: unlocked ? meta.color : "#888", fontSize: "12px", fontWeight: 700, marginBottom: "5px" }}>
                      <span>{done}/{STAGES_PER_LEVEL} مراحل</span>
                      <span>{'★'.repeat(stars)}</span>
                    </div>
                    <div style={{ height: "8px", background: "rgba(255,255,255,0.1)", borderRadius: "4px", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg, ${meta.color}, #ffd700)`, borderRadius: "4px", transition: "width 0.5s ease" }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Collection button */}
          <button
            onClick={() => setView("collection")}
            style={{ background: "linear-gradient(135deg, #8b6914, #c0a060)", border: "2px solid #ffd700", borderRadius: "14px", color: "#fff", padding: "12px 30px", fontSize: "16px", fontWeight: 800, cursor: "pointer" }}
          >
            🏆 متحف الكنوز ({myCollection.length}/{allArtifacts.length})
          </button>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════
          VIEW: STAGES
      ════════════════════════════════════════════════════════ */}
      {!dataLoading && view === "stages" && selectedLevel && (
        <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: "24px", padding: "20px", boxSizing: "border-box" }}>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", maxWidth: "700px", background: "rgba(0,0,0,0.55)", border: `2px solid ${LEVEL_META[selectedLevel].color}`, borderRadius: "18px", padding: "14px 24px", boxSizing: "border-box", direction: "rtl", backdropFilter: "blur(8px)" }}>
            <div>
              <div style={{ color: LEVEL_META[selectedLevel].color, fontWeight: 800, fontSize: "13px" }}>
                {LEVEL_META[selectedLevel].icon} المستوى {selectedLevel}
              </div>
              <h2 style={{ color: "#fff", margin: "4px 0 0", fontSize: "18px" }}>{LEVEL_META[selectedLevel].name}</h2>
            </div>
            <button onClick={() => setView("levels")} style={{ background: LEVEL_META[selectedLevel].color, border: "none", borderRadius: "10px", color: "#1a0a00", padding: "9px 18px", fontWeight: 800, cursor: "pointer", fontSize: "14px" }}>
              ← الخريطة
            </button>
          </div>

          {/* Stage nodes */}
          <div style={{ display: "flex", gap: "36px", flexWrap: "wrap", justifyContent: "center", background: "rgba(0,0,0,0.4)", borderRadius: "24px", padding: "30px 20px", backdropFilter: "blur(8px)", maxWidth: "700px", width: "100%", boxSizing: "border-box" }}>
            {Array.from({ length: STAGES_PER_LEVEL }, (_, stageIdx) => {
              const unlocked = isStageUnlocked(selectedLevel, stageIdx);
              const stars    = getStageStars(selectedLevel, stageIdx);
              const color    = LEVEL_META[selectedLevel].color;

              return (
                <div key={stageIdx} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div
                    onClick={() => { if (unlocked) launchStage(selectedLevel, stageIdx); }}
                    style={{
                      width: "88px", height: "88px", borderRadius: "50%",
                      background: unlocked ? `radial-gradient(circle at 35% 35%, #fff8e0, ${color})` : "radial-gradient(circle at 35% 35%, #ccc, #777)",
                      border: `5px solid ${unlocked ? "#fff" : "#bbb"}`,
                      boxShadow: unlocked ? `0 8px 20px rgba(${hexToRgb(color)},0.5)` : "0 4px 10px rgba(0,0,0,0.3)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "32px", fontWeight: 900,
                      color: unlocked ? "#3d1f00" : "#666",
                      cursor: unlocked ? "pointer" : "not-allowed",
                      transition: "all 0.3s cubic-bezier(0.175,0.885,0.32,1.275)",
                    }}
                    onMouseEnter={e => { if (unlocked) { e.currentTarget.style.transform = "scale(1.15) translateY(-5px)"; } }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "none"; }}
                  >
                    {unlocked ? stageIdx + 1 : "🔒"}
                  </div>
                  <div style={{ color: "#fff", fontSize: "12px", fontWeight: 700, marginTop: "8px", textShadow: "1px 1px 3px rgba(0,0,0,0.8)" }}>
                    المرحلة {stageIdx + 1}
                  </div>
                  <div style={{ display: "flex", gap: "2px", marginTop: "4px" }}>
                    {[1, 2, 3].map(s => (
                      <span key={s} style={{ fontSize: "15px", color: s <= stars ? "#ffd700" : "rgba(255,255,255,0.2)", filter: s <= stars ? "drop-shadow(0 0 4px #ffd700)" : "none" }}>★</span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════
          VIEW: GAME
      ════════════════════════════════════════════════════════ */}
      {view === "game" && stageQuestions.length > 0 && !stageResult && (
        <div className={style["game-screen"]}>
          <img
            src="/tomb/pharaoh.png"
            alt="Pharaoh"
            className={`${style["character-avatar"]} ${pharaohMood === "happy" ? style["avatar-happy"] : pharaohMood === "angry" ? style["avatar-angry"] : style["bounce"]}`}
          />

          <div className={style["status-bar"]}>
            <span>المستوى {selectedLevel} | المرحلة {selectedStageIndex + 1}</span>
            <span style={{ display: "flex", gap: "4px", alignItems: "center" }}>
              {[...Array(3)].map((_, i) => (
                <span key={i} style={{ opacity: i < lives ? 1 : 0.2, filter: i < lives ? "none" : "grayscale(100%)" }}>❤️</span>
              ))}
            </span>
          </div>

          <div style={{ textAlign: "center", color: "#d4af37", fontSize: "13px", marginTop: "8px" }}>
            السؤال {questionIndex + 1} / {stageQuestions.length} &nbsp;|&nbsp; الصحيحة: {correctCount}
          </div>

          <div style={{ textAlign: "center", color: "#ffd700", fontSize: "14px", fontWeight: 700, marginTop: "6px" }}>
            {categoryMap[stageQuestions[questionIndex]?.category] || ""}
          </div>

          <h2 style={{ marginTop: "12px", color: "#fff", fontSize: "20px", textAlign: "center" }}>رتّب الكلمات لتكوين الجملة الصحيحة</h2>

          <div className={style["puzzle-container"]}>
            {/* Answer area + hint */}
            <div className={style["answer-wrapper"]}>
              <button className={style["hint-btn"]} onClick={useHint} disabled={hints === 0} title="مساعدة">
                💡 <div className={style["hint-badge"]}>{hints}</div>
              </button>
              <div className={style["answer-box"]}>
                {userAnswer.length === 0 ? <span style={{ opacity: 0.5 }}>رتب الكلمات هنا...</span> : null}
                {userAnswer.map((word, idx) => (
                  <span
                    key={idx}
                    className={`${style["word-card"]} ${style["user-word"]} ${style["clickable"]}`}
                    onClick={() => handleReturnWord(word, idx)}
                  >{word}</span>
                ))}
              </div>
            </div>

            {/* Word pool */}
            <div className={style["words-pool"]}>
              {shuffledWords.map((word, idx) => (
                <button key={idx} className={style["word-btn"]} onClick={() => handleWordClick(word)}>
                  {word}
                </button>
              ))}
            </div>
          </div>

          <button className={style["btn-secondary"]} onClick={() => { setView("stages"); setIsMusicPlaying(false); }}>
            انسحاب 🏃‍♂️
          </button>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════
          VIEW: STAGE RESULT
      ════════════════════════════════════════════════════════ */}
      {view === "game" && stageResult && (
        <div className={stageResult.passed ? style["victory-screen"] : style["gameover-screen"]} style={{ zIndex: 100 }}>
          {stageResult.passed ? (
            <>
              {!chestOpened ? (
                <>
                  <h1>🎉 مبروك يا بطل! 🎉</h1>
                  <div style={{ fontSize: "28px", margin: "8px 0" }}>
                    {[1,2,3].map(s => (
                      <span key={s} style={{ color: s <= stageResult.stars ? "#ffd700" : "rgba(255,255,255,0.2)", textShadow: s <= stageResult.stars ? "0 0 12px #ffd700" : "none" }}>★</span>
                    ))}
                  </div>
                  <p>الصحيحة: {stageResult.correct} / {stageResult.total}</p>
                  <p>لقد وجدت صندوق كنز قديم!</p>
                  <button className={style["chest-btn"]} onClick={openChest}>🎁</button>
                  <p>اضغط لفتح الصندوق</p>
                </>
              ) : (
                <>
                  <div className={style["artifact-reveal"]}>
                    <h1>✨ اكتشاف مذهل! ✨</h1>
                    <span className={style["artifact-icon"]}>{reward?.icon}</span>
                    <h2 style={{ color: "#ffd700" }}>{reward?.name}</h2>
                    <p>تمت إضافته إلى متحفك</p>
                  </div>
                  <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
                    {/* Next stage if available */}
                    {selectedStageIndex + 1 < STAGES_PER_LEVEL &&
                      isStageUnlocked(selectedLevel, selectedStageIndex + 1) && (
                      <button onClick={() => launchStage(selectedLevel, selectedStageIndex + 1)}>
                        المرحلة التالية ▶️
                      </button>
                    )}
                    <button onClick={() => setView("collection")}>الذهاب للمتحف 🏛️</button>
                    <button onClick={() => launchStage(selectedLevel, selectedStageIndex)}>إعادة المرحلة 🔄</button>
                    <button onClick={() => setView("stages")}>خريطة المراحل 🗺️</button>
                  </div>
                </>
              )}
            </>
          ) : (
            <>
              <div style={{ fontSize: "80px", marginBottom: "20px" }}>☠️</div>
              <h1 style={{ color: "#e74c3c", textShadow: "0 0 10px red" }}>محاولة فاشلة!</h1>
              <p>الصحيحة: {stageResult.correct} / {stageResult.total}</p>
              <p>لا تستسلم! أعد المحاولة.</p>
              <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
                <button onClick={() => launchStage(selectedLevel, selectedStageIndex)} style={{ backgroundColor: "#e74c3c", color: "white", border: "2px solid white" }}>
                  إعادة نفس المرحلة 🔄
                </button>
                <button className={style["btn-secondary"]} onClick={() => setView("stages")}>
                  خريطة المراحل 🗺️
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════
          VIEW: COLLECTION
      ════════════════════════════════════════════════════════ */}
      {view === "collection" && (
        <div className={style["start-screen"]}>
          <h2>🏆 مجموعتي الأثرية</h2>
          <p>لقد جمعت {myCollection.length} من {allArtifacts.length} كنوز</p>
          <div className={style["collection-grid"]}>
            {allArtifacts.map(artifact => {
              const unlocked = myCollection.find(a => a.id === artifact.id);
              return (
                <div key={artifact.id} className={`${style["artifact-slot"]} ${unlocked ? style["unlocked"] : style["locked"]}`}>
                  <span className={style["slot-icon"]}>{unlocked ? artifact.icon : "🔒"}</span>
                  <span className={style["slot-name"]}>{unlocked ? artifact.name : "؟؟؟"}</span>
                </div>
              );
            })}
          </div>
          <button className={style["btn-secondary"]} onClick={() => setView("levels")}>
            العودة للخريطة 🗺️
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Helper ───────────────────────────────────────────────────────────────────
function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}

export default TombPuzzle;
