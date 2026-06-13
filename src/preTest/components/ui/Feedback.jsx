import React from "react";

export function Feedback({ score, stars }) {
  const message = score >= 75 ? "رائع!" : score >= 45 ? "محاولة جيدة" : "ولا يهمك، كمل";
  return (
    <div className="feedback" role="alert" aria-live="polite">
      <b>{message}</b>
      <span>{"⭐".repeat(Math.max(1, stars))}</span>
    </div>
  );
}
export default Feedback;
