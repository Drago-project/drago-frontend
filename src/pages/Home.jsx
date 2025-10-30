import volcano from "../assets/islands/Adventure Games Island.svg";
import pyramids from "../assets/islands/History Stories Island.svg";
import writing from "../assets/islands/Writing Workshop Island.svg";
import books from "../assets/islands/Reading Quest Island.svg";
import styles from "../styles/Home.module.css";
import Lottie from "lottie-react";
import { useTranslation } from "react-i18next";
// import animate2 from "../assets/animation/drago(holding map 2).svg";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function Home() {
  const [animationData, setAnimationData] = useState(null);
  const { i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
 
  useEffect(() => {
    // Load the animation data
    fetch("/map.json")
      .then((response) => response.json())
      .then((data) => setAnimationData(data))
      .catch((error) => {
        console.error("Error loading animation:", error);
        setAnimationData(null);
      });
  }, []);

  return (
    <div className={styles.homePage}>
      {/* <p>help drago find his way to the treasure!</p> */}

      {/* Drago Animation */}
      <div className={styles.animationRow}>
        {animationData ? (
          <Lottie animationData={animationData} loop={true} autoplay={true} />
        ) : (
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
        )}
      </div>

      {/* First row of islands */}
      <div className={styles.islandRow}>
        <Link to="#" className={styles.islandLink}>
          <div className={styles.islandWrapper}>
          <div className={styles.empty}></div>
            <div className={styles.islandLabel}>{isRTL? "جزيرة الكتابة" : "Writing Workshop Island"}</div>
            <img src={writing} alt="Writing Workshop Island" />
          </div>
        </Link>
        <Link to="#" className={styles.islandLink}>
          <div className={styles.islandWrapper}>
            <div className={styles.islandLabel}>{isRTL? "جزيرة التاريخ" : "History Stories Island"}</div>
            <img src={pyramids} alt="History Stories Island" />
          <div className={styles.empty}></div>
          </div>
        </Link>
      </div>

      {/* Second row of islands */}
      <div className={styles.islandRow}>
        <Link to="#" className={styles.islandLink}>
          <div className={styles.islandWrapper}>
          <div className={styles.empty}></div>
            <div className={styles.islandLabel}>{isRTL? "جزيرة البركان" : "Adventure Games Island"}</div>
            <img src={volcano} alt="Adventure Games Island" />
          </div>
        </Link>
        <Link to="#" className={styles.islandLink}>
          <div className={styles.islandWrapper}>
            <div className={styles.islandLabel}>{isRTL? "جزيرة القراءة" : "Reading Quest Island"}</div>
            <img src={books} alt="Reading Quest Island" />
          <div className={styles.empty}></div>
          </div>
        </Link>
      </div>
    </div>
  );
}

export default Home;
