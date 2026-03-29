// src/games/WordHunt.jsx
import React, { useState, useEffect } from "react";
import Confetti from "react-confetti";
import Lottie from "lottie-react";
import { useNavigate } from "react-router-dom";
import { Home, CheckCircle, XCircle, Volume2, Play, Heart } from "lucide-react";
import api from "../server/api";

// استيراد ملف الـ CSS الشامل
import "../styles/WordHut.css";

// استدعاء الموارد (تأكد إن الملفات دي عندك)
import sad from "../assets/emotions/drago(crying).svg";
import celebrationAnimation from "../assets/animation/celebration drago.json";

// --- كود المودال (Win/Lose) مدمج هنا ---
const playSystemSound = (type) => {
  const sounds = {
    win: "/sounds/win.mp3",
    // مسار صوت الخسارة الجديد
    lose: "/sounds/hut_lose.mp3",
  };
  const soundPath = sounds[type];
  if (soundPath) {
    const audio = new Audio(soundPath);
    audio.play().catch((e) => console.log(`Sound error:`, e));
  }
};

const WinModal = ({ score, restartGame, children }) => {
  const navigate = useNavigate();
  useEffect(() => {
    playSystemSound("win");
  }, []);

  return (
    <div className="wh-modal-overlay">
      <Confetti
        width={window.innerWidth}
        height={window.innerHeight}
        recycle={true}
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
        <p className="wh-modal-subtitle">{children}</p>
        <p className="wh-modal-score">النتيجة النهائية: {score}</p>
        <div className="wh-btn-container">
          <button className="wh-modal-btn" onClick={restartGame}>
            العب مجدداً
          </button>
          <button className="wh-exit-btn" onClick={() => navigate("/home")}>
            خروج
          </button>
        </div>
      </div>
    </div>
  );
};

const LoseModal = ({ score, restartGame, children }) => {
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
        <p className="wh-modal-subtitle">{children}</p>
        <p className="wh-modal-score">النتيجة النهائية: {score}</p>
        <div className="wh-btn-container">
          <button className="wh-modal-btn" onClick={restartGame}>
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

// --- كود اللعبة الأساسي ---
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

const originalWordData = [
  {
    id: 1,
    wordBefore: "سـمـ",
    wordAfter: "",
    missing: "ك",
    options: ["ق", "ك", "خ"],
    hint: "حيوان يعيش في البحر",
  },
  {
    id: 2,
    wordBefore: "كِتـ",
    wordAfter: "ب",
    missing: "ا",
    options: ["ا", "ى", "و"],
    hint: "نقرأ فيه الدروس",
  },
  {
    id: 3,
    wordBefore: "شـجـ",
    wordAfter: "ة",
    missing: "ر",
    options: ["ز", "ر", "د"],
    hint: "نزرعها ونسقيها",
  },
  {
    id: 4,
    wordBefore: "قـ",
    wordAfter: "ـر",
    missing: "م",
    options: ["م", "ل", "ع"],
    hint: "يظهر في السماء ليلاً",
  },
  {
    id: 5,
    wordBefore: "عِـنَـ",
    wordAfter: "",
    missing: "ب",
    options: ["ت", "ن", "ب"],
    hint: "فاكهة صغيرة ولذيذة",
  },
  {
    id: 6,
    wordBefore: "جَـمَـ",
    wordAfter: "",
    missing: "ل",
    options: ["ل", "ا", "ك"],
    hint: "حيوان يعيش في الصحراء",
  },
  {
    id: 7,
    wordBefore: "فِـيـ",
    wordAfter: "",
    missing: "ل",
    options: ["ل", "ك", "ر"],
    hint: "حيوان ضخم له خرطوم",
  },
  {
    id: 8,
    wordBefore: "بَـ",
    wordAfter: "ـة",
    missing: "ط",
    options: ["ض", "ص", "ط"],
    hint: "طائر يسبح في الماء",
  },
];

const WordHuntGame = () => {
  const [gameQuestions, setGameQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [gameState, setGameState] = useState("start");
  const [selectedOption, setSelectedOption] = useState(null);

  const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const playSound = (type) => {
    const audio = gameSounds[type];
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch((e) => console.log(e));
    }
  };

  // دالة نطق الحرف
  const speakLetter = (e, letter) => {
    e.stopPropagation();
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(letter);
      utterance.lang = "ar-SA";
      utterance.rate = 0.7; // تبطيء الصوت عشان الحرف يكون واضح
      window.speechSynthesis.speak(utterance);
    }
  };

  const startGame = async () => {
    try {
      playSound("click");
      setGameState("loading");
      setShowFeedback(false);
      setSelectedOption(null);
      setScore(0);
      setLives(3);

      // fetch levels
      const levelsRes = await api.get("/api/hutgame/levels");
      const levels = levelsRes.data?.data || [];
      const levelNumber = levels.length ? levels[0].levelNumber : 0;

      // fetch 5 random words for the level
      const fetches = Array.from({ length: 5 }).map(() =>
        api.get(`/api/hutgame/levels/${levelNumber}/random-word`),
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
          };
        })
        .filter(Boolean);

      if (questions.length) {
        setGameQuestions(questions);
      } else {
        const shuffled = shuffleArray(originalWordData).slice(0, 5);
        setGameQuestions(shuffled);
      }

      setCurrentQuestion(0);
      setGameState("playing");
    } catch (err) {
      console.error("HutGame API error:", err);

      const shuffled = shuffleArray(originalWordData).slice(0, 5);
      setGameQuestions(shuffled);
      setCurrentQuestion(0);
      setGameState("playing");
    }
  };

  const handleAnswer = (selectedLetter) => {
    if (gameState !== "playing" || showFeedback) return;

    setSelectedOption(selectedLetter);
    const currentWord = gameQuestions[currentQuestion];

    if (selectedLetter === currentWord.missing) {
      setIsCorrect(true);
      setScore(score + 1);
      playSound("correct");
      setTimeout(() => setShowFeedback(true), 300);

      setTimeout(() => {
        if (currentQuestion < gameQuestions.length - 1) {
          setCurrentQuestion(currentQuestion + 1);
          setShowFeedback(false);
          setSelectedOption(null);
        } else {
          setGameState("won");
        }
      }, 1800);
    } else {
      setIsCorrect(false);
      playSound("wrong");
      setTimeout(() => setShowFeedback(true), 300);
      const newLives = lives - 1;
      setLives(newLives);
      if (newLives === 0) {
        setTimeout(() => {
          setGameState("lost");
        }, 1500);
      } else {
        setTimeout(() => {
          setShowFeedback(false);
          setSelectedOption(null);
        }, 1500);
      }
    }
  };

  const getButtonClass = (letter) => {
    if (selectedOption !== letter) return "wh-option-btn wh-opt-default";
    return isCorrect
      ? "wh-option-btn wh-opt-correct"
      : "wh-option-btn wh-opt-wrong";
  };

  const currentData = gameQuestions[currentQuestion] || originalWordData[0];
  const progressPercentage = (currentQuestion / gameQuestions.length) * 100;

  // Wrapper عشان الخلفية تظهر في كل الصفحات
  const PageWrapper = ({ children }) => (
    <div className="wh-full-page">
      <div className="wh-wrapper">{children}</div>
    </div>
  );

  if (gameState === "start") {
    return (
      <PageWrapper>
        <div className="wh-start-screen">
          <div className="wh-icon-container">
            <Home className="w-24 h-24 text-amber-600" size={64} />
          </div>
          <h1 className="wh-title">كوخ الكلمات</h1>
          <p className="wh-subtitle">
            ساعدنا في إصلاح الكلمات المكسورة داخل الكوخ!
          </p>
          <button onClick={startGame} className="wh-btn wh-btn-start">
            <Play size={28} fill="white" /> ابدأ اللعب
          </button>
        </div>
      </PageWrapper>
    );
  }

  if (gameState === "loading") {
    return (
      <PageWrapper>
        <div className="wh-start-screen">
          <h2 className="wh-title">جارٍ تحضير اللعبة...</h2>
          <p className="wh-subtitle">جلب كلمات المستوى من الخادم</p>
          <button className="wh-btn wh-btn-start" disabled>
            <Play size={28} fill="white" /> تحميل...
          </button>
        </div>
      </PageWrapper>
    );
  }

  if (gameState === "won") {
    return (
      <WinModal score={score} restartGame={startGame}>
        ممتاز! لقد قمت بإصلاح كل الكلمات
      </WinModal>
    );
  }

  if (gameState === "lost") {
    return (
      <LoseModal score={score} restartGame={startGame}>
        لا تحزن، يمكنك المحاولة مرة أخرى
      </LoseModal>
    );
  }

  return (
    <PageWrapper>
      <div className="wh-header">
        <h1
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontWeight: "bold",
          }}
        >
          <Home size={24} /> كوخ الكلمات
        </h1>
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
      </div>

      <div className="wh-game-container">
        <div className="wh-progress-bar">
          <div
            className="wh-progress-fill"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>

        <div
          style={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          {/* --- إضافة التلميح (Hint) هنا --- */}
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

          <div className="wh-word-display">
            <div className="wh-word-text">
              <span>{currentData.wordBefore}</span>
              <span className="wh-missing-letter">?</span>
              <span>{currentData.wordAfter}</span>
            </div>
          </div>
        </div>

        <div className="wh-options-grid">
          {currentData.options.map((letter, index) => (
            // تم تغيير الزرار لـ div مقسوم عشان يمنع اللخبطة
            <div
              key={index}
              className={getButtonClass(letter)}
              style={{
                position: "relative",
                padding: 0, // بنشيل البادينج عشان نقسم الزرار صح
                display: "flex",
                overflow: "hidden",
                cursor:
                  showFeedback || selectedOption !== null
                    ? "default"
                    : "pointer",
                opacity: showFeedback || selectedOption !== null ? 0.7 : 1,
              }}
            >
              {/* مساحة اختيار الحرف - كبيرة وواضحة */}
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

              {/* خط فاصل بين مساحة الاختيار ومساحة الصوت */}
              <div
                style={{ width: "2px", background: "rgba(0,0,0,0.1)" }}
              ></div>

              {/* مساحة الصوت - مخصصة للصوت بس ومفصولة تماماً */}
              <div
                onClick={(e) => {
                  if (!showFeedback && selectedOption === null)
                    speakLetter(e, letter);
                }}
                style={{
                  width: "70px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(255, 255, 255, 0.4)",
                  transition: "background 0.2s",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.background =
                    "rgba(255, 255, 255, 0.6)")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.background =
                    "rgba(255, 255, 255, 0.4)")
                }
              >
                <Volume2 size={24} color="#2563eb" />
              </div>
            </div>
          ))}
        </div>

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
    </PageWrapper>
  );
};

export default WordHuntGame;
