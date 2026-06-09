import React from "react";
import dragoWave from "../../assets/drago/drago-wave.svg";

export function Rest({ onResume }) {
  return (
    <div className="rest">
      <div style={{ width: "90px", height: "90px", marginBottom: "12px", display: "flex", alignItems: "center", justifyContent: "center" }} aria-hidden="true">
        <img src={dragoWave} alt="Drago Waving" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
      </div>
      <h3>استراحة قصيرة</h3>
      <p>خد نفس، اشرب مياه، ولما تكون جاهز تابع الرحلة.</p>
      <button
        type="button"
        className="primary"
        onClick={onResume}
        aria-label="متابعة الرحلة"
      >
        متابعة
      </button>
    </div>
  );
}
export default Rest;
