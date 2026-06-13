import React, { useState } from "react";
import { fuzzyScore } from "../../utils/arabic.js";

export function TextInput({ item, onFinish }) {
  const [text, setText] = useState("");

  function handleSubmit() {
    const score = fuzzyScore(text, item.correctAnswer);
    onFinish(score, text);
  }

  return (
    <>
      <input
        className="answer"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={item.placeholder || "اكتب هنا"}
        aria-label="إجابتك المكتوبة"
        maxLength={50}
      />
      <button
        type="button"
        className="primary"
        disabled={!text.trim()}
        onClick={handleSubmit}
      >
        تأكيد
      </button>
    </>
  );
}
