import React from "react";

export function Title({ tag, title, text }) {
  return (
    <div className="title">
      <span className="missionTag">{tag}</span>
      <div>
        <h2>{title}</h2>
        <p>{text}</p>
      </div>
    </div>
  );
}
export default Title;
