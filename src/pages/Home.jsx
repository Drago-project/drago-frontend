import volcano from "../assets/islands/Adventure Games Island.svg";
import pyramids from "../assets/islands/History Stories Island.svg";
import writing from "../assets/islands/Writing Workshop Island.svg";
import books from "../assets/islands/Reading Quest Island.svg";
import styles from "../styles/Home.module.css";
import Lottie from "lottie-react";
import { useTranslation } from "react-i18next";
import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";

const Island = React.memo(function Island({ to, label, img, alt, children }) {
  return (
    <Link to={to} className={styles.islandLink}>
      <div className={styles.islandWrapper}>
        <div className={styles.empty}></div>
        <div className={styles.islandLabel}>{label}</div>
        <img src={img} alt={alt} />
        {children}
      </div>
    </Link>
  );
});

function Home() {
  const [animationData, setAnimationData] = useState(null);
  const { i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  useEffect(() => {
    fetch("/map.json")
      .then((response) => response.json())
      .then((data) => setAnimationData(data))
      .catch((error) => {
        console.error("Error loading animation:", error);
        setAnimationData(null);
      });
  }, []);

  const labels = useMemo(
    () => ({
      adventure: isRTL ? "جزيرة البركان" : "Adventure Games Island",
      history: isRTL ? "جزيرة التاريخ" : "History Stories Island",
      writing: isRTL ? "جزيرة الكتابة" : "Writing Workshop Island",
      reading: isRTL ? "جزيرة القراءة" : "Reading Quest Island",
    }),
    [isRTL]
  );

  const animationNode = useMemo(() => {
    if (animationData) {
      return (
        <Lottie animationData={animationData} loop={true} autoplay={true} />
      );
    }
    return (
      <div
        style={{
          width: 250,
          height: 250,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        Loading animation...
      </div>
    );
  }, [animationData]);

  return (
    <div className={styles.homePage}>
      <div className={styles.animationRow}>{animationNode}</div>

      <div className={styles.islandRow}>
        <Island
          to="/games/volcano-words"
          label={labels.adventure}
          img={volcano}
          alt={labels.adventure}
        />
        <Island
          to="#"
          label={labels.history}
          img={pyramids}
          alt={labels.history}
        >
          <div className={styles.empty}></div>
        </Island>
      </div>

      <div className={styles.islandRow}>
        {/* 👇 هنا التعديل: الجزيرة دي دلوقتي بتودي على لعبة كوخ الكلمات */}
        <Island
          to="/games/word-hunt"
          label={labels.writing}
          img={writing}
          alt={labels.writing}
        />
        <Island
          to="/games/reading-quest"
          label={labels.reading}
          img={books}
          alt={labels.reading}
        >
          <div className={styles.empty}></div>
        </Island>
      </div>
    </div>
  );
}

export default Home;
