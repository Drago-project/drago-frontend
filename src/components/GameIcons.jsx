// src/components/GameIcons.jsx
import React from "react";
// لاحظ: هنحتاج نمرر الستايل كـ prop أو نستخدم className مباشر لو الستايل جلوبال
// بس هنا الأسهل نمرر الـ className

export const BoatSVG = ({ className }) => (
  <svg width="100" height="100" viewBox="0 0 100 100" className={className}>
    <g transform="translate(0, 10)">
      <path
        d="M10,60 Q50,90 90,60 L85,50 L15,50 Z"
        fill="#8D6E63"
        stroke="#5D4037"
        strokeWidth="2"
      />
      <path d="M15,50 L85,50 L90,60 L10,60 Z" fill="#A1887F" />
      <rect
        x="45"
        y="30"
        width="5"
        height="40"
        transform="rotate(-15 47 50)"
        fill="#4E342E"
      />
      <ellipse
        cx="40"
        cy="75"
        rx="10"
        ry="4"
        transform="rotate(-15 40 75)"
        fill="#4E342E"
      />
      <path
        d="M50,50 L50,10 L80,40 Z"
        fill="#FFF9C4"
        stroke="#FBC02D"
        strokeWidth="1"
      />
    </g>
  </svg>
);

export const TornadoSVG = ({ className }) => (
  <svg width="90" height="90" viewBox="0 0 100 100" className={className}>
    <g
      style={{
        transformOrigin: "50px 50px",
        animation: "spinTornado 1s linear infinite",
      }}
    >
      {/* ضفت الأنيميشن هنا inline مؤقتاً عشان نضمن انه يشتغل لو اتفصل عن CSS */}
      <style>
        {`@keyframes spinTornado { from { transform: rotate(0deg) scale(1); } to { transform: rotate(360deg) scale(1.05); } }`}
      </style>
      <ellipse cx="50" cy="85" rx="10" ry="3" fill="#78909C" opacity="0.8" />
      <ellipse cx="50" cy="75" rx="18" ry="5" fill="#607D8B" opacity="0.9" />
      <ellipse cx="50" cy="60" rx="25" ry="7" fill="#546E7A" />
      <ellipse cx="50" cy="40" rx="35" ry="9" fill="#455A64" />
      <ellipse cx="50" cy="20" rx="45" ry="11" fill="#37474F" />
      <path
        d="M20,30 Q10,40 20,50"
        stroke="white"
        strokeWidth="2"
        fill="none"
        opacity="0.5"
      />
      <path
        d="M80,50 Q90,60 80,70"
        stroke="white"
        strokeWidth="2"
        fill="none"
        opacity="0.5"
      />
    </g>
  </svg>
);
