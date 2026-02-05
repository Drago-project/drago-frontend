import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "../styles/About.module.css";
import drago from "../assets/poses/drago(three quarter front).svg";
import Footer from "../components/Footer";

// Fixed SVG imports
import brain from "../assets/about/brain.svg";
import connection from "../assets/about/connection.svg";
import visual from "../assets/about/visual learning.svg";
import distructing from "../assets/about/distructing.svg";
import { TextAlignCenter } from "lucide-react";

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

  const quizData = {
    ar: t("about.cabins", { returnObjects: true }) || [],
    en: t("about.cabins", { returnObjects: true }) || [],
  };

  const currentLang = i18n.language;

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
  const langKey = currentLang.startsWith("ar") ? "ar" : "en";

  return (
    <>
      <div
        className={`${styles.dragoWrapper} ${currentLang === "en" ? styles.ltr : ""}`}
        dir={currentLang === "ar" ? "rtl" : "ltr"}
      >
        {/* Hero Section */}
        <section className={styles.heroSection}>
          <div className={styles.heroContent}>
            <h1 className={styles.mainTitle}>{t("about.title")}</h1>
          </div>
        </section>

        {/* Educational Sections */}
        <div className={styles.educationalContainer}>
          {/* Section 1 */}
          <section className={styles.infoCard}>
            <div className={styles.cardContent}>
              <div className={styles.textSection}>
                <h2 className={styles.sectionTitle}>
                  {t("about.section1.title")}
                </h2>
                <p className={styles.sectionText}>{t("about.section1.text")}</p>
              </div>
              <div className={styles.imageSection}>
                <div className={styles.imageWrapper}>
                  <img src={brain} alt="Dyslexia brain" />
                </div>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section className={`${styles.infoCard} ${styles.reverseCard}`}>
            <div className={styles.cardContent}>
              <div className={styles.imageSection}>
                <div className={styles.imageWrapper}>
                  <img src={visual} alt="Learning styles" />
                </div>
              </div>
              <div className={styles.textSection}>
                <h2 className={styles.sectionTitle}>
                  {t("about.section2.title")}
                </h2>
                <ul className={styles.factsList}>
                  <li className={styles.factItem}>
                    <span className={styles.factIcon}>📊</span>
                    <div>
                      <strong>{t("about.section2.fact1.label")}</strong>
                      <span> {t("about.section2.fact1.text")}</span>
                    </div>
                  </li>
                  <li className={styles.factItem}>
                    <span className={styles.factIcon}>📚</span>
                    <div>
                      <strong>{t("about.section2.fact2.label")}</strong>
                      <span> {t("about.section2.fact2.text")}</span>
                    </div>
                  </li>
                  <li className={styles.factItem}>
                    <span className={styles.factIcon}>🎓</span>
                    <div>
                      <strong>{t("about.section2.fact3.label")}</strong>
                      <span> {t("about.section2.fact3.text")}</span>
                    </div>
                  </li>
                  <li className={styles.factItem}>
                    <span className={styles.factIcon}>⏰</span>
                    <div>
                      <strong>{t("about.section2.fact4.label")}</strong>
                      <span> {t("about.section2.fact4.text")}</span>
                    </div>
                  </li>
                  <li className={styles.factItem}>
                    <span className={styles.factIcon}>🧬</span>
                    <div>
                      <strong>{t("about.section2.fact5.label")}</strong>
                      <span> {t("about.section2.fact5.text")}</span>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className={styles.infoCard}>
            <div className={styles.cardContent}>
              <div className={styles.textSection}>
                <h2 className={styles.sectionTitle}>
                  {t("about.section3.title")}
                </h2>
                <p className={styles.sectionText}>
                  {t("about.section3.intro")}
                </p>
                <ul className={styles.benefitsList}>
                  <li>
                    <span className={styles.checkmark}>✓</span>
                    {t("about.section3.benefit1")}
                  </li>
                  <li>
                    <span className={styles.checkmark}>✓</span>
                    {t("about.section3.benefit2")}
                  </li>
                  <li>
                    <span className={styles.checkmark}>✓</span>
                    {t("about.section3.benefit3")}
                  </li>
                </ul>
                <div className={styles.highlightBox}>
                  <span className={styles.quoteIcon}>💡</span>
                  <p>{t("about.section3.highlight")}</p>
                </div>
              </div>
              <div className={styles.imageSection}>
                <div className={styles.imageWrapper}>
                  <img src={connection} alt="Support" />
                </div>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section className={`${styles.infoCard} ${styles.reverseCard}`}>
            <div className={styles.cardContent}>
              <div className={styles.imageSection}>
                <div className={styles.imageWrapper}>
                  <img src={distructing} alt="Difficulties" />
                </div>
              </div>
              <div className={styles.textSection}>
                <h2 className={styles.sectionTitle}>
                  {t("about.section4.title")}
                </h2>
                <div className={styles.difficultiesGrid}>
                  <div className={styles.difficultyItem}>
                    <span className={styles.diffIcon}>🐌</span>
                    <p>{t("about.section4.difficulty1")}</p>
                  </div>
                  <div className={styles.difficultyItem}>
                    <span className={styles.diffIcon}>🔤</span>
                    <p>{t("about.section4.difficulty2")}</p>
                  </div>
                  <div className={styles.difficultyItem}>
                    <span className={styles.diffIcon}>🔄</span>
                    <p>{t("about.section4.difficulty3")}</p>
                  </div>
                  <div className={styles.difficultyItem}>
                    <span className={styles.diffIcon}>🧩</span>
                    <p>{t("about.section4.difficulty4")}</p>
                  </div>
                  <div className={styles.difficultyItem}>
                    <span className={styles.diffIcon}>📝</span>
                    <p>{t("about.section4.difficulty5")}</p>
                  </div>
                  <div className={styles.difficultyItem}>
                    <span className={styles.diffIcon}>✍️</span>
                    <p>{t("about.section4.difficulty6")}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
        <section style={{ textAlign: "center" }}>
          <h2 className={styles.heroSubtitle}>{t("about.subtitle")}</h2>
        </section>
        {/* Ferris Wheel Section */}
        <section className={styles.wheelSection}>
          {/* Animated clouds */}
          <div className={styles.cloudsContainer}>
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className={styles.cloud}
                style={{
                  top: `${10 + Math.random() * 60}%`,
                  animationDuration: `${30 + i * 5}s`,
                  animationDelay: `${i * 2}s`,
                  fontSize: `${2 + Math.random() * 2}rem`,
                }}
              >
                ☁️
              </div>
            ))}
          </div>

          <Wheel
            handleStartQuiz={handleStartQuiz}
            quizData={quizData}
            currentLang={langKey}
            visitedCabins={visitedCabins}
            cabinPositions={cabinPositions}
          />

    

          {/* Modal Quiz */}
          {isModalOpen && currentQuiz && (
            <QuizModal
              currentQuiz={currentQuiz}
              currentQuestionIndex={currentQuestionIndex}
              showFeedback={showFeedback}
              selectedOption={selectedOption}
              isCorrect={isCorrect}
              currentScore={currentScore}
              isQuizFinished={isQuizFinished}
              handleAnswer={handleAnswer}
              handleNext={handleNext}
              closeQuiz={closeQuiz}
              setIsModalOpen={setIsModalOpen}
              t={t}
            />
          )}
          <div className={styles.groundScene}>
            <img
              src={drago}
              alt="Drago Mascot"
              className={styles.dragoOnGround}
            />
            <Ground />
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
};

function Wheel({
  handleStartQuiz,
  quizData,
  currentLang,
  visitedCabins,
  cabinPositions,
}) {
  const cabinEmojis = ["💡", "💬", "👧", "🚫", "🔍", "🧩"];

  return (
    <div className={styles.wheelArea}>
      <div className={styles.stand}></div>
      <div className={styles.wheel}>
        <div className={styles.wheelCenter}></div>
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
            <div className={styles.cabinContent}>
              <span className={styles.cabinEmoji}>{cabinEmojis[idx]}</span>
              <span className={styles.cabinTitle}>{item.title}</span>
              {visitedCabins.has(item.id || idx + 1) && (
                <span className={styles.completeBadge}>✓</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function QuizModal({
  currentQuiz,
  currentQuestionIndex,
  showFeedback,
  selectedOption,
  isCorrect,
  currentScore,
  isQuizFinished,
  handleAnswer,
  handleNext,
  closeQuiz,
  setIsModalOpen,
  t,
}) {
  return (
    <div className={styles.overlay} onClick={() => setIsModalOpen(false)}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button
          className={styles.closeBtn}
          onClick={() => setIsModalOpen(false)}
        >
          ✕
        </button>

        {!isQuizFinished ? (
          <>
            <div className={styles.quizHeader}>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{
                    width: `${((currentQuestionIndex + 1) / currentQuiz.questions.length) * 100}%`,
                  }}
                ></div>
              </div>
              <span className={styles.questionCounter}>
                {currentQuestionIndex + 1} / {currentQuiz.questions.length}
              </span>
            </div>

            <h3 className={styles.quizQuestion}>
              {currentQuiz.questions[currentQuestionIndex].q}
            </h3>

            <div className={styles.optionsGrid}>
              {currentQuiz.questions[currentQuestionIndex].options.map(
                (opt, i) => (
                  <button
                    key={i}
                    className={`${styles.quizBtn} ${
                      showFeedback
                        ? i ===
                          currentQuiz.questions[currentQuestionIndex].correct
                          ? styles.correct
                          : selectedOption === i
                            ? styles.wrong
                            : ""
                        : selectedOption === i
                          ? styles.selected
                          : ""
                    }`}
                    onClick={() => !showFeedback && handleAnswer(i)}
                    disabled={showFeedback}
                  >
                    <span className={styles.optionLetter}>
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className={styles.optionText}>{opt}</span>
                  </button>
                ),
              )}
            </div>

            {showFeedback && (
              <div
                className={`${styles.feedbackBox} ${isCorrect ? styles.correctFeedback : styles.wrongFeedback}`}
              >
                <div className={styles.feedbackHeader}>
                  {isCorrect ? (
                    <>
                      <span className={styles.feedbackIcon}>🎉</span>
                      <strong>{t("about.correct")}</strong>
                    </>
                  ) : (
                    <>
                      <span className={styles.feedbackIcon}>💭</span>
                      <strong>{t("about.wrong")}</strong>
                    </>
                  )}
                </div>
                <p className={styles.explanation}>
                  {currentQuiz.questions[currentQuestionIndex].explanation}
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
          <div className={styles.finishScreen}>
            <div className={styles.trophyAnimation}>🏆</div>
            <h2 className={styles.finishTitle}>{t("about.finishTitle")}</h2>
            <div className={styles.scoreCircle}>
              <svg className={styles.scoreRing} viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  stroke="#e0e0e0"
                  strokeWidth="8"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  stroke="#4CAF50"
                  strokeWidth="8"
                  strokeDasharray={`${(currentScore / currentQuiz.questions.length) * 339} 339`}
                  strokeLinecap="round"
                  transform="rotate(-90 60 60)"
                />
              </svg>
              <div className={styles.scoreText}>
                <span className={styles.scoreNumber}>{currentScore}</span>
                <span className={styles.scoreTotal}>
                  /{currentQuiz.questions.length}
                </span>
              </div>
            </div>
            <p className={styles.scoreMessage}>
              {currentScore === currentQuiz.questions.length
                ? t("about.scoreMsg")
                : t("about.reviewMsg")}
            </p>
            <button className={styles.finishBtn} onClick={closeQuiz}>
              {t("about.closeBtn") || "إنهاء"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function DragoMascot({ visitedCabins, currentLang }) {
  const { t } = useTranslation();
  return (
    <div className={styles.mascotContainer}>
      <div className={styles.bubble}>
        {visitedCabins.size === 6
          ? currentLang === "ar"
            ? "أحسنت! أنت بطل المعرفة! 🎉"
            : "Great! You are a Knowledge Champion! 🎉"
          : t("about.dragoIntro")}
      </div>
      <div className={styles.dragoAvatar}>
        <img src={drago} alt="Drago Mascot" />
      </div>
    </div>
  );
}

function Ground() {
  return (
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
  );
}

export default About;
