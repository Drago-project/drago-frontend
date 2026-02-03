import React, { useState } from "react";
import { useTranslation } from "react-i18next";
// Correctly importing the CSS module
import styles from "../styles/About.module.css";
import drago from "../assets/poses/drago(three quarter front).svg";
import Footer from "../components/Footer";

const About = () => {
  const { i18n, t } = useTranslation();
  const [visitedCabins, setVisitedCabins] = useState(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [currentScore, setCurrentScore] = useState(0);
  const [isQuizFinished, setIsQuizFinished] = useState(false);

  // بيانات الكويز من i18n
  const quizData = {
    ar: t("about.cabins", { returnObjects: true }) || [],
    en: t("about.cabins", { returnObjects: true }) || [],
  };

  const currentLang = i18n.language;

  // Emoji mappings for cabins
  const cabinEmojis = ["💡", "💬", "👧", "🚫", "🔍", "🧩"];

  const handleStartQuiz = (item, index) => {
    setCurrentQuiz({ ...item, id: index + 1 });
    setCurrentQuestionIndex(0);
    setCurrentScore(0);
    setShowFeedback(false);
    setSelectedOption(null);
    setIsQuizFinished(false);
    setIsModalOpen(true);
  };

  const handleAnswer = (index) => {
    setSelectedOption(index);
    const correctIndex = currentQuiz.questions[currentQuestionIndex].correct;

    if (index === correctIndex) {
      setIsCorrect(true);
      setCurrentScore(currentScore + 1);
    } else {
      setIsCorrect(false);
    }
    setShowFeedback(true);
  };

  const handleNext = () => {
    if (currentQuestionIndex < currentQuiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setShowFeedback(false);
      setSelectedOption(null);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    setIsQuizFinished(true);
    // تسجيل العربة كـ "مكتملة" إذا أنهى الكويز
    const newVisited = new Set(visitedCabins);
    newVisited.add(currentQuiz.id);
    setVisitedCabins(newVisited);
  };

  const closeQuiz = () => {
    setIsModalOpen(false);
    setIsQuizFinished(false);
  };

  const cabinPositions = [
    styles.pos1,
    styles.pos2,
    styles.pos3,
    styles.pos4,
    styles.pos5,
    styles.pos6,
  ];

  return (
    <>
      <div
        className={`${styles.dragoWrapper} ${currentLang === "en" ? styles.ltr : ""}`}
        dir={currentLang === "ar" ? "rtl" : "ltr"}
      >
        {/* Clouds */}
        <div className="clouds-container">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className={styles.cloud}
              style={{
                top: `${Math.random() * 10}vh`,
                animationDuration: `${20 + i * 100}s`,
                left: `${Math.random() * 10}vw`,
              }}
            >
              ☁️
            </div>
          ))}
        </div>

        {/*    
      <header className={styles.header}>
      <h1 className={styles.title}>{t("about.title")}</h1>
      <p className={styles.subtitle}>{t("about.subtitle")}</p>
      </header> */}

        <div className={styles.wheelArea}>
          <div className={styles.stand}></div>
          <div className={styles.wheel}>
            <div
              className={styles.spoke}
              style={{ transform: "translate(-50%, -50%) rotate(0deg)" }}
            ></div>
            <div
              className={styles.spoke}
              style={{ transform: "translate(-50%, -50%) rotate(60deg)" }}
            ></div>
            <div
              className={styles.spoke}
              style={{ transform: "translate(-50%, -50%) rotate(120deg)" }}
            ></div>

            {quizData[currentLang].map((item, idx) => (
              <div
                key={item.id || idx}
                className={`${styles.cabin} ${visitedCabins.has(item.id || idx + 1) ? styles.cabinVisited : ""} ${cabinPositions[idx]}`}
                onClick={() => handleStartQuiz(item, idx)}
              >
                <span className={styles.cabinEmoji}>{cabinEmojis[idx]}</span>
                <span className={styles.cabinTitle}>{item.title}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.mascotContainer}>
          <div className={styles.bubble}>
            {visitedCabins.size === 6
              ? currentLang === "ar"
                ? "أحسنت! أنت بطل المعرفة! 🎉"
                : "Great! You are a Knowledge Champion! 🎉"
              : t("about.dragoIntro")}
          </div>
          <div className={styles.dragoAvatar}>
            <img
              src={drago}
              alt="Drago Mascot"
              style={{ width: "100%", height: "auto" }}
            />
          </div>
        </div>

        {/* Modal Quiz */}
        {isModalOpen && currentQuiz && (
          <div className={styles.overlay}>
            <div className={styles.modalContent}>
              <button
                className={styles.closeBtn}
                onClick={() => setIsModalOpen(false)}
              >
                ✕
              </button>

              {!isQuizFinished ? (
                <>
                  <div style={{ textAlign: "center", marginBottom: "20px" }}>
                    <span
                      style={{
                        color: "var(--color-dark-gray)",
                        fontSize: "0.9rem",
                      }}
                    >
                      {currentQuestionIndex + 1} /{" "}
                      {currentQuiz.questions.length}
                    </span>
                    <h3 className={styles.quizQuestion}>
                      {currentQuiz.questions[currentQuestionIndex].q}
                    </h3>
                  </div>

                  <div className={styles.optionsGrid}>
                    {currentQuiz.questions[currentQuestionIndex].options.map(
                      (opt, i) => (
                        <button
                          key={i}
                          className={`${styles.quizBtn} ${
                            showFeedback
                              ? i ===
                                currentQuiz.questions[currentQuestionIndex]
                                  .correct
                                ? styles.correct
                                : selectedOption === i
                                  ? styles.wrong
                                  : ""
                              : ""
                          }`}
                          onClick={() => !showFeedback && handleAnswer(i)}
                          disabled={showFeedback}
                        >
                          {opt}
                        </button>
                      ),
                    )}
                  </div>

                  {showFeedback && (
                    <div className={styles.feedbackBox}>
                      <strong>
                        {isCorrect ? (
                          <span style={{ color: "#155724" }}>
                            ✓ {t("about.correct")}
                          </span>
                        ) : (
                          <span style={{ color: "#721c24" }}>
                            ✗ {t("about.wrong")}
                          </span>
                        )}
                      </strong>
                      <p
                        style={{
                          marginTop: "5px",
                          color: "var(--color-dark-gray)",
                        }}
                      >
                        {
                          currentQuiz.questions[currentQuestionIndex]
                            .explanation
                        }
                      </p>
                      <button className={styles.nextBtn} onClick={handleNext}>
                        {currentQuestionIndex < currentQuiz.questions.length - 1
                          ? t("about.nextBtn")
                          : t("about.closeBtn")}
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div style={{ textAlign: "center", padding: "20px" }}>
                  <div style={{ fontSize: "4rem", marginBottom: "20px" }}>
                    🏆
                  </div>
                  <h2 style={{ color: "var(--color-primary)" }}>
                    {t("about.finishTitle")}
                  </h2>
                  <div
                    style={{
                      width: "80px",
                      height: "80px",
                      background: "var(--color-avatar)",
                      color: "white",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.8rem",
                      fontWeight: "bold",
                      margin: "20px auto",
                    }}
                  >
                    {currentScore}/{currentQuiz.questions.length}
                  </div>
                  <p>
                    {currentScore === currentQuiz.questions.length
                      ? t("about.scoreMsg")
                      : t("about.reviewMsg")}
                  </p>
                  <button className={styles.nextBtn} onClick={closeQuiz}>
                    OK
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        <div className={styles.ground}>
          <svg
            viewBox="0 0 1440 320"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
          >
            <path
              d="M0,220 C200,180 400,260 600,240 800,220 1000,180 1200,210 1350,230 1440,200 1440,200 L1440,320 L0,320 Z"
              fill="#81c784"
            />

            <path
              d="M0,240 C250,200 500,300 750,250 1000,200 1200,260 1440,230 L1440,320 L0,320 Z"
              fill="#66bb6a"
            />

            <path
              d="M0,260 C300,220 600,320 900,270 1150,230 1300,260 1440,250 L1440,320 L0,320 Z"
              fill="#43a047"
            />
          </svg>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default About;
