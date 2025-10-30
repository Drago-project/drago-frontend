import volcano from "../assets/islands/Adventure Games Island.svg";
import pyramids from "../assets/islands/History Stories Island.svg";
import writing from "../assets/islands/Writing Workshop Island.svg";
import books from "../assets/islands/Reading Quest Island.svg";
import styles from "../styles/Home.module.css";
import Lottie from "lottie-react";
// import animate2 from "../assets/animation/drago(holding map 2).svg";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function Home() {
  const [animationData, setAnimationData] = useState(null);

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
          <Lottie
            animationData={animationData}
            loop={true}
            autoplay={true}
            style={{ width: "130%" }}
          />
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
        <Link to="/writing" className={styles.islandLink}>
          <div className={styles.empty}></div>
          <img src={writing} alt="Writing Workshop Island" />
        </Link>
        <Link to="/alphabets" className={styles.islandLink}>
          <img src={pyramids} alt="Pyramids Island" />
          <div className={styles.empty}></div>
        </Link>
      </div>

      {/* Second row of islands */}
      <div className={styles.islandRow}>
        <Link to="/spelling" className={styles.islandLink}>
          <div className={styles.empty}></div>
          <img src={volcano} alt="Volcano Island" />
        </Link>
        <Link to="/reading" className={styles.islandLink}>
          <img src={books} alt="Books Island" />
          <div className={styles.empty}></div>
        </Link>
      </div>
    </div>
  );
}

export default Home;
