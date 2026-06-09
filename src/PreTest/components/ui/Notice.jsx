import React from "react";

export function Notice({ children, warn }) {
  return (
    <div
      className={`notice ${warn ? "warn" : ""}`}
      role={warn ? "alert" : "status"}
    >
      {children}
    </div>
  );
}
export default Notice;
