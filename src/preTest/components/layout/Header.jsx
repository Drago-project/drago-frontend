import React from "react";
import dragoFront from "../../assets/drago/drago-front.svg";

function Badge({ children }) {
  return <span className="badge">{children}</span>;
}

function Progress({ value }) {
  return (
    <div className="progress" role="progressbar" aria-valuenow={value} aria-valuemin="0" aria-valuemax="100">
      <i style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}

export function Header({ current, progress, stars, viewMode, setViewMode }) {
  return (
    <header className="hero">
      <div className="heroTop">
        <div className="mascot" aria-hidden="true" style={{ overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255, 255, 255, 0.15)", border: "none" }}>
          <img src={dragoFront} alt="Drago Mascot" style={{ width: "90%", height: "90%", objectFit: "contain" }} />
        </div>
        <div>
          <p>رحلة Drago</p>
          <h1>{viewMode === "child" ? current.childTitle : current.therapistTitle}</h1>
          <span>
            {viewMode === "child"
              ? "مهمات قصيرة، نجوم، وتشجيع."
              : "وضع الأخصائي: درجات، زمن، أخطاء، وتقرير."}
          </span>
        </div>
      </div>
      <div className="heroBadges">
        <Badge>⭐ {stars}</Badge>
        <Badge>{progress}%</Badge>
        <button
          type="button"
          className="modeButton"
          onClick={() => setViewMode(viewMode === "child" ? "therapist" : "child")}
          aria-label={viewMode === "child" ? "التبديل لوضع الأخصائي" : "التبديل لوضع الطفل"}
        >
          {viewMode === "child" ? "وضع الأخصائي" : "وضع الطفل"}
        </button>
      </div>
      <Progress value={progress} />
    </header>
  );
}
export default Header;
