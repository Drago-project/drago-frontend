import volcano from "../assets/islands/Adventure Games Island.svg";
import pyramids from "../assets/islands/History Stories Island.svg";
import writing from "../assets/islands/Writing Workshop Island.svg";
import books from "../assets/islands/Reading Quest Island.svg";
import styles from "../styles/Home.module.css";
import Lottie from "lottie-react";
// import animate2 from "../assets/animation/drago(holding map 2).svg";
import { useState, useEffect } from "react";


function Home() {
  const [animationData, setAnimationData] = useState(null);

  useEffect(() => {
    // Load the animation data
    fetch('/map.json')
      .then(response => response.json())
      .then(data => setAnimationData(data))
      .catch(error => {
        console.error('Error loading animation:', error);
        setAnimationData(null);
      });
  }, []);

  return (
    <div className={styles.homePage}>
      <div className={styles.islandRow}>
      <img
        src={writing}
        alt="Writing Workshop Island"
        style={{ marginTop: "10%" }}
      />
        <img src={pyramids} alt="Pyramids Island" />
      </div>
      <div className={styles.animationRow}>
        <p>help drago find his way to the treasure!</p>
        {/* Try Lottie animation */}
        {animationData ? (
          <Lottie 
            animationData={animationData}
            loop={true}
            autoplay={true}
            style={{ width:"130%"}}
            />
          ) : (
            <div style={{ width: 250, height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            Loading animation...
          </div>
        )}
       
        
      </div>
      <div className={styles.islandRow}>
        <img src={volcano} alt="Volcano Island" style={{ marginTop: "10%" }} />
        <img src={books} alt="Books Island" style={{ marginTop: "5%" }} />
      </div>
    </div>
  );
}

export default Home;
