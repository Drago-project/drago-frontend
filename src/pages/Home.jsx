import volcano from "../assets/islands/Adventure Games Island.svg";
import pyramids from "../assets/islands/History Stories Island.svg";
import writing from "../assets/islands/Writing Workshop Island.svg";
import books from "../assets/islands/island1.svg";
import animate1 from "../assets/animation/drago(holding map 1).svg";
import animate2 from "../assets/animation/drago(holding map 2).svg";
// import books from "../assets/islands/";

function Home() {
    return (
        <div>
            <img src={volcano} alt="Volcano Island" />
            <img src={pyramids} alt="Pyramids Island" />
            <img src={writing} alt="Writing Workshop Island" />
            <img src={books} alt="Books Island" />

            <img src={animate1} alt="Drago holding map 1" />
            <img src={animate2} alt="Drago holding map 2" />
            <p>help drago find his way to the treasure!</p>
        </div>
    )
}

export default Home
