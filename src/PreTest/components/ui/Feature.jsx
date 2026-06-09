import React from "react";

export function Feature({ icon, title, text }) {
  return (
    <div className="feature">
      <div aria-hidden="true">{icon}</div>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}
export default Feature;
