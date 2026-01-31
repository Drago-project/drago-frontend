import { useState, useEffect, useRef } from "react";
import style from "../styles/TombPuzzle.module.css";

function TombPuzzle() {
  const [screen, setScreen] = useState("start");
  const [pharaohMood, setPharaohMood] = useState("neutral");

  // --- إعدادات الموسيقى ---
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);

  // التأكد من مسار الصوت (موجود في public/sounds)
  const musicRef = useRef(new Audio("/sounds/tomb-bg.mp3"));

  useEffect(() => {
    musicRef.current.loop = true;
    musicRef.current.volume = 0.6;
    if (isMusicPlaying) {
      musicRef.current.play().catch((e) => console.log("Music blocked:", e));
    } else {
      musicRef.current.pause();
    }
    return () => {
      musicRef.current.pause();
    };
  }, [isMusicPlaying]);

  const toggleMusic = () => setIsMusicPlaying(!isMusicPlaying);

  const playSound = (type) => {
    let audioSrc = "";

    // استخدام الملفات المحلية من فولدر sounds
    if (type === "correct") audioSrc = "/sounds/correct.mp3";
    if (type === "wrong") audioSrc = "/sounds/wrong.mp3";
    if (type === "win") audioSrc = "/sounds/win.mp3";
    if (type === "gameover") audioSrc = "/sounds/lose.mp3";

    // باقي الأصوات
    if (type === "click")
      audioSrc = "https://s3.amazonaws.com/freecodecamp/drums/Heater-1.mp3";
    if (type === "pop")
      audioSrc = "https://s3.amazonaws.com/freecodecamp/drums/Dsc_Oh.mp3";
    if (type === "magic")
      audioSrc =
        "https://s3.amazonaws.com/freecodecamp/drums/Give_us_a_light.mp3";
    if (type === "chest")
      audioSrc = "https://s3.amazonaws.com/freecodecamp/drums/Cev_H2.mp3";

    if (audioSrc) {
      const audio = new Audio(audioSrc);
      audio.volume = 0.4;
      audio.play().catch((e) => console.log("SFX error", e));
    }
  };

  const allQuestionsPool = [
    {
      correct: ["قناع", "الملك", "الذهبي"],
      shuffled: ["الذهبي", "قناع", "الملك"],
      info: "قناع توت عنخ آمون مصنوع من 11 كيلو ذهب خالص! ⚖️",
    },
    {
      correct: ["مفتاح", "باب", "المقبرة"],
      shuffled: ["المقبرة", "مفتاح", "باب"],
      info: "الفراعنة استخدموا مفاتيح خشبية ضخمة للأبواب! 🗝️",
    },
    {
      correct: ["عين", "حورس", "الحارسة"],
      shuffled: ["حورس", "الحارسة", "عين"],
      info: "عين حورس كانت رمز للحماية والشفاء عند المصريين. 👁️",
    },
    {
      correct: ["كنز", "الفرعون", "المفقود"],
      shuffled: ["الفرعون", "المفقود", "كنز"],
      info: "لسه فيه مقابر وكنوز كتير تحت الرمل ماكتشفناهاش! 🏜️",
    },
    {
      correct: ["لعنة", "الفراعنة", "الغامضة"],
      shuffled: ["الغامضة", "لعنة", "الفراعنة"],
      info: "اللعنة كانت خرافة لتخويف اللصوص من سرقة المقابر. 👻",
    },
    {
      correct: ["هرم", "خوفو", "الأكبر"],
      shuffled: ["الأكبر", "خوفو", "هرم"],
      info: "الهرم الأكبر كان أطول بناء في العالم لمدة 3800 سنة! 📐",
    },
    {
      correct: ["تمثال", "أبو", "الهول"],
      shuffled: ["أبو", "الهول", "تمثال"],
      info: "أبو الهول جسمه جسم أسد ورأسه رأس إنسان (رمز القوة والعقل). 🦁",
    },
    {
      correct: ["نهر", "النيل", "العظيم"],
      shuffled: ["العظيم", "نهر", "النيل"],
      info: "النيل هو أطول نهر في العالم وبسببه قامت الحضارة. 🌊",
    },
    {
      correct: ["زهرة", "اللوتس", "الجميلة"],
      shuffled: ["اللوتس", "الجميلة", "زهرة"],
      info: "اللوتس بتفتح الصبح وتقفل بالليل، عشان كده هي رمز الشمس! 🌸",
    },
    {
      correct: ["معبد", "الكرنك", "الضخم"],
      shuffled: ["الضخم", "الكرنك", "معبد"],
      info: "معبد الكرنك هو أكبر دار عبادة بناها الإنسان في التاريخ! 🏛️",
    },
    {
      correct: ["حجر", "رشيد", "القديم"],
      shuffled: ["رشيد", "القديم", "حجر"],
      info: "بسبب الحجر ده قدرنا نفك رموز اللغة الهيروغليفية. 🪨",
    },
    {
      correct: ["ملكة", "مصر", "كليوباترا"],
      shuffled: ["كليوباترا", "مصر", "ملكة"],
      info: "كليوباترا كانت بتتكلم 7 لغات وكانت ذكية جداً! 👑",
    },
    {
      correct: ["تابوت", "المومياء", "الملكي"],
      shuffled: ["المومياء", "تابوت", "الملكي"],
      info: "التابوت كان بيتصنع من الذهب أو الخشب عشان يحمي المومياء. ⚰️",
    },
    {
      correct: ["وادي", "الملوك", "السري"],
      shuffled: ["السري", "الملوك", "وادي"],
      info: "الملوك بنوا مقابرهم في الجبل عشان يخفوها عن اللصوص. ⛰️",
    },
    {
      correct: ["رمز", "الحياة", "الأبدي"],
      shuffled: ["الأبدي", "رمز", "الحياة"],
      info: "مفتاح الحياة (عنخ) هو أشهر رمز مصري وبيمثل الحياة الأبدية. ☥",
    },
    {
      correct: ["كاتب", "مصر", "الجلوس"],
      shuffled: ["الجلوس", "مصر", "كاتب"],
      info: "الكاتب كان وظيفته مهمة جداً لأنه بيسجل التاريخ والضرايب. 📜",
    },
    {
      correct: ["تاج", "الشمال", "الأحمر"],
      shuffled: ["الأحمر", "الشمال", "تاج"],
      info: "مصر كانت مقسومة لمملكتين، تاج الشمال أحمر وتاج الجنوب أبيض. 👑",
    },
    {
      correct: ["مسلة", "الأقصر", "العالية"],
      shuffled: ["العالية", "الأقصر", "مسلة"],
      info: "المسلة هي برج حجري طويل مكتوب عليه انتصارات الملك. 🗼",
    },
    {
      correct: ["مركب", "الشمس", "الذهبي"],
      shuffled: ["الشمس", "الذهبي", "مركب"],
      info: "القدماء دفنوا مراكب جنب الأهرامات عشان الملك يسافر بيها للسماء. ⛵",
    },
    {
      correct: ["سر", "التحنيط", "الغامض"],
      shuffled: ["الغامض", "سر", "التحنيط"],
      info: "التحنيط كان بياخد 70 يوم عشان يحافظوا على الجسم سليم! 🤕",
    },
  ];

  // --- قائمة الكنوز (5 فقط) ---
  const allArtifacts = [
    { id: 1, name: "القناع الذهبي", icon: "👑" },
    { id: 2, name: "الجعران المقدس", icon: "🪲" },
    { id: 3, name: "عين حورس", icon: "👁️" },
    { id: 4, name: "مفتاح الحياة", icon: "☥" },
    { id: 5, name: "تمثال باستت", icon: "🐈" },
  ];

  const getRandomLevels = () => {
    const shuffled = [...allQuestionsPool].sort(() => 0.5 - Math.random());
    return shuffled
      .slice(0, 5)
      .map((level, index) => ({ ...level, id: index + 1 }));
  };

  const [levels, setLevels] = useState([]);
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [shuffledWords, setShuffledWords] = useState([]);
  const [userAnswer, setUserAnswer] = useState([]);
  const [lives, setLives] = useState(3);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });
  const [secretInfo, setSecretInfo] = useState({ show: false, text: "" });
  const [hints, setHints] = useState(3);

  // نظام الكنوز
  const [myCollection, setMyCollection] = useState([]);
  const [reward, setReward] = useState(null);
  const [chestOpened, setChestOpened] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("pharaoh_treasures");
    if (saved) {
      const parsedCollection = JSON.parse(saved);
      const validCollection = parsedCollection.filter((savedItem) =>
        allArtifacts.some((validItem) => validItem.id === savedItem.id),
      );
      setMyCollection(validCollection);
      if (validCollection.length !== parsedCollection.length) {
        localStorage.setItem(
          "pharaoh_treasures",
          JSON.stringify(validCollection),
        );
      }
    }
  }, []);

  const openChest = () => {
    if (chestOpened) return;
    playSound("chest");
    playSound("win");
    setChestOpened(true);
    const randomArtifact =
      allArtifacts[Math.floor(Math.random() * allArtifacts.length)];
    setReward(randomArtifact);
    const alreadyHave = myCollection.find((a) => a.id === randomArtifact.id);
    if (!alreadyHave) {
      const newCollection = [...myCollection, randomArtifact];
      setMyCollection(newCollection);
      localStorage.setItem("pharaoh_treasures", JSON.stringify(newCollection));
    }
  };

  const showToast = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(
      () => setNotification({ show: false, message: "", type: "" }),
      2000,
    );
  };

  useEffect(() => {
    if (screen === "game" && levels.length > 0) {
      setShuffledWords(levels[currentLevelIndex].shuffled);
      setUserAnswer([]);
      setPharaohMood("neutral");
      setSecretInfo({ show: false, text: "" });
    }
  }, [screen, currentLevelIndex, levels]);

  const useHint = () => {
    if (hints <= 0 || notification.show) return;
    // const currentCorrectWord =
    //   levels[currentLevelIndex].correct[userAnswer.length];

    let firstErrorIndex = 0;
    while (
      firstErrorIndex < userAnswer.length &&
      userAnswer[firstErrorIndex] ===
        levels[currentLevelIndex].correct[firstErrorIndex]
    ) {
      firstErrorIndex++;
    }
    const wordNeeded = levels[currentLevelIndex].correct[firstErrorIndex];
    if (!wordNeeded) return;

    playSound("magic");
    setHints(hints - 1);

    const keptPrefix = userAnswer.slice(0, firstErrorIndex);
    const wrongWordsToRemove = userAnswer.slice(firstErrorIndex);
    const newAnswer = [...keptPrefix, wordNeeded];
    setUserAnswer(newAnswer);

    const newShuffled = [...shuffledWords, ...wrongWordsToRemove];
    const indexToRemove = newShuffled.indexOf(wordNeeded);
    if (indexToRemove > -1) newShuffled.splice(indexToRemove, 1);
    setShuffledWords(newShuffled);

    if (newAnswer.length === levels[currentLevelIndex].correct.length) {
      checkAnswer(newAnswer, levels[currentLevelIndex]);
    }
  };

  const handleWordClick = (word) => {
    if (notification.show || secretInfo.show) return;
    playSound("click");
    const newAnswer = [...userAnswer, word];
    setUserAnswer(newAnswer);
    const newShuffled = [...shuffledWords];
    const indexToRemove = newShuffled.indexOf(word);
    if (indexToRemove > -1) newShuffled.splice(indexToRemove, 1);
    setShuffledWords(newShuffled);

    if (newAnswer.length === levels[currentLevelIndex].correct.length) {
      checkAnswer(newAnswer, levels[currentLevelIndex]);
    }
  };

  const handleReturnWord = (word, index) => {
    if (notification.show || secretInfo.show) return;
    playSound("click");
    const newAnswer = [...userAnswer];
    newAnswer.splice(index, 1);
    setUserAnswer(newAnswer);
    const newShuffled = [...shuffledWords, word];
    setShuffledWords(newShuffled);
  };

  const checkAnswer = (answer, levelData) => {
    if (answer.join(" ") === levelData.correct.join(" ")) {
      setPharaohMood("happy");
      playSound("correct");
      setTimeout(() => {
        playSound("pop");
        setSecretInfo({ show: true, text: levelData.info });
      }, 500);
    } else {
      setPharaohMood("angry");
      playSound("wrong");
      if (lives > 1) {
        showToast("❌ ترتيب خاطئ! خسرت قلب 💔", "error");
        setLives(lives - 1);
        setTimeout(() => {
          setShuffledWords(levels[currentLevelIndex].shuffled);
          setUserAnswer([]);
          setPharaohMood("neutral");
        }, 1000);
      } else {
        setLives(0);
        setTimeout(() => {
          playSound("gameover");
          setScreen("gameover");
        }, 500);
      }
    }
  };

  const nextLevel = () => {
    setSecretInfo({ show: false, text: "" });
    if (currentLevelIndex + 1 < levels.length) {
      setCurrentLevelIndex(currentLevelIndex + 1);
    } else {
      setChestOpened(false);
      setReward(null);
      setScreen("victory");
      playSound("win");
    }
  };

  const startGame = () => {
    setLives(3);
    setHints(3);
    setCurrentLevelIndex(0);
    setLevels(getRandomLevels());
    setScreen("game");
    setPharaohMood("neutral");
    if (!isMusicPlaying) setIsMusicPlaying(true);
  };

  const retryGame = () => {
    setLives(3);
    setHints(3);
    setCurrentLevelIndex(0);
    setScreen("game");
    setPharaohMood("neutral");
    if (levels.length > 0) {
      setShuffledWords(levels[0].shuffled);
      setUserAnswer([]);
    }
  };

  const goHome = () => setScreen("start");
  const goToCollection = () => setScreen("collection");

  return (
    <div className={style["game-container"]}>
      <button className={style["music-toggle"]} onClick={toggleMusic}>
        {isMusicPlaying ? "🔊" : "🔇"}
      </button>

      {/* Info Card */}
      {secretInfo.show && (
        <div className={style["secret-overlay"]}>
          <div className={style["secret-scroll"]}>
            <h2>📜 بردية سرية اكتشفتها!</h2>
            <p>{secretInfo.text}</p>
            <button className={style["btn-next"]} onClick={nextLevel}>
              متابعة الرحلة ➡️
            </button>
          </div>
        </div>
      )}

      {notification.show && (
        <div
          className={`${style["notification-popup"]} ${style[notification.type]}`}
        >
          {notification.message}
        </div>
      )}

      {/* Start Screen */}
      {screen === "start" && (
        <div className={style["start-screen"]}>
          {/* 👇 1. المسار المباشر للصورة من public/tomb */}
          <img
            src="/tomb/pharaoh.png"
            alt="Pharaoh"
            className={`${style["character-avatar"]} ${style["bounce"]}`}
          />
          <h1>🏺 مقبرة الأسرار 🏺</h1>
          <p>
            رتب الكلمات لتفتح 5 كنوز مخفية...
            <br />
            هل يمكنك جمعها كلها؟
          </p>

          <button className={style["btn-start"]} onClick={startGame}>
            ابدأ المغامرة 🔦
          </button>

          <button
            className={`${style["btn-start"]} ${style["btn-collection"]}`}
            onClick={goToCollection}
          >
            🏆 متحف الكنوز ({myCollection.length}/5)
          </button>
        </div>
      )}

      {/* Collection Screen */}
      {screen === "collection" && (
        <div className={style["start-screen"]}>
          <h2>🏆 مجموعتي الأثرية</h2>
          <p>لقد جمعت {myCollection.length} من 5 كنوز</p>

          <div className={style["collection-grid"]}>
            {allArtifacts.map((artifact) => {
              const isUnlocked = myCollection.find((a) => a.id === artifact.id);
              return (
                <div
                  key={artifact.id}
                  className={`${style["artifact-slot"]} ${
                    isUnlocked ? style["unlocked"] : style["locked"]
                  }`}
                >
                  <span className={style["slot-icon"]}>
                    {isUnlocked ? artifact.icon : "🔒"}
                  </span>
                  <span className={style["slot-name"]}>
                    {isUnlocked ? artifact.name : "؟؟؟"}
                  </span>
                </div>
              );
            })}
          </div>

          <button className={style["btn-secondary"]} onClick={goHome}>
            العودة للقائمة 🏠
          </button>
        </div>
      )}

      {/* Game Screen */}
      {screen === "game" && levels.length > 0 && (
        <div className={style["game-screen"]}>
          {/* 👇 2. المسار المباشر هنا أيضاً */}
          <img
            src="/tomb/pharaoh.png"
            alt="Pharaoh"
            className={`${style["character-avatar"]} ${
              pharaohMood === "happy"
                ? style["avatar-happy"]
                : pharaohMood === "angry"
                  ? style["avatar-angry"]
                  : style["bounce"]
            }`}
          />

          <div className={style["status-bar"]}>
            <span>لغز {currentLevelIndex + 1} / 5</span>
            <span className={style["hearts"]}>
              {[...Array(3)].map((_, i) => (
                <span
                  key={i}
                  style={{
                    opacity: i < lives ? 1 : 0.2,
                    filter: i < lives ? "none" : "grayscale(100%)",
                  }}
                >
                  ❤️
                </span>
              ))}
            </span>
          </div>

          <h2 style={{ marginTop: "20px" }}>ما هذا الشيء؟</h2>

          <div className={style["puzzle-container"]}>
            <div className={style["answer-wrapper"]}>
              <button
                className={style["hint-btn"]}
                onClick={useHint}
                disabled={hints === 0}
                title="مساعدة"
              >
                💡 <div className={style["hint-badge"]}>{hints}</div>
              </button>
              <div className={style["answer-box"]}>
                {userAnswer.length === 0 ? (
                  <span style={{ opacity: 0.5 }}>رتب الوصف...</span>
                ) : null}
                {userAnswer.map((word, index) => (
                  <span
                    key={index}
                    className={`${style["word-card"]} ${style["user-word"]} ${style["clickable"]}`}
                    onClick={() => handleReturnWord(word, index)}
                  >
                    {word}
                  </span>
                ))}
              </div>
            </div>
            <div className={style["words-pool"]}>
              {shuffledWords.map((word, index) => (
                <button
                  key={index}
                  className={style["word-btn"]}
                  onClick={() => handleWordClick(word)}
                >
                  {word}
                </button>
              ))}
            </div>
          </div>

          <button className={style["btn-secondary"]} onClick={goHome}>
            انسحاب 🏃‍♂️
          </button>
        </div>
      )}

      {/* Victory Screen */}
      {screen === "victory" && (
        <div className={style["victory-screen"]} style={{ zIndex: 100 }}>
          {!chestOpened ? (
            <>
              <h1>🎉 مبروك يا بطل! 🎉</h1>
              <p>لقد وجدت صندوق كنز قديم!</p>
              <button className={style["chest-btn"]} onClick={openChest}>
                🎁
              </button>
              <p>اضغط لفتح الصندوق</p>
            </>
          ) : (
            <>
              <div className={style["artifact-reveal"]}>
                <h1>✨ اكتشاف مذهل! ✨</h1>
                <span className={style["artifact-icon"]}>{reward.icon}</span>
                <h2 style={{ color: "#ffd700" }}>{reward.name}</h2>
                <p>تمت إضافته إلى متحفك</p>
              </div>

              <button onClick={goToCollection} style={{ marginRight: "10px" }}>
                الذهاب للمتحف 🏛️
              </button>
              <button onClick={startGame}>مغامرة جديدة 🔄</button>
            </>
          )}
        </div>
      )}

      {/* Game Over */}
      {screen === "gameover" && (
        <div className={style["gameover-screen"]}>
          <div style={{ fontSize: "80px", marginBottom: "20px" }}>☠️</div>
          <h1 style={{ color: "#e74c3c", textShadow: "0 0 10px red" }}>
            محاولة فاشلة!
          </h1>
          <p>تاهت القطع منك...</p>
          <button
            onClick={retryGame}
            style={{
              backgroundColor: "#e74c3c",
              color: "white",
              border: "2px solid white",
              marginBottom: "10px",
            }}
          >
            إعادة نفس المحاولة 🔄
          </button>
          <br />
          <button className={style["btn-secondary"]} onClick={startGame}>
            تحدي جديد 🆕
          </button>
        </div>
      )}
    </div>
  );
}

export default TombPuzzle;
