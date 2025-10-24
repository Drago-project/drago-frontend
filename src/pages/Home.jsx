import volcano from "../assets/islands/Adventure Games Island.svg";
import pyramids from "../assets/islands/History Stories Island.svg";
import writing from "../assets/islands/Writing Workshop Island.svg";
import books from "../assets/islands/Reading Quest Island.svg";
import animate1 from "../assets/animation/drago(holding map 1).svg";
import animate2 from "../assets/animation/drago(holding map 2).svg";
import styles from "../styles/Home.module.css";
// import  from "../assets/islands/island1.svg";

function Home() {
  return (
    <div className={styles.homePage}>
      <div className={styles.islandRow}>
        <img src={volcano} alt="Volcano Island" style={{ marginTop: "10%" }} />
        <img src={pyramids} alt="Pyramids Island" />
      </div>
      <div className={styles.animationRow}>
        <p>help drago find his way to the treasure!</p>
        <img src={animate1} alt="Drago holding map 1" />
        {/* <img src={animate2} alt="Drago holding map 2" /> */}
      </div>
      <div className={styles.islandRow}>
        <img
          src={writing}
          alt="Writing Workshop Island"
          style={{ marginTop: "10%" }}
        />
        <img src={books} alt="Books Island" />
      </div>
    </div>
  );
}

export default Home;
