import React, { useState, useEffect, useRef } from "react";
import { Choice } from "./Choice.jsx";
import { normalizeArabic } from "../../utils/arabic.js";

export function ReactionChoice({ item, onFinish }) {
  const [selected, setSelected] = useState("");
  const mountTimeRef = useRef(Date.now());

  useEffect(() => {
    mountTimeRef.current = Date.now();
  }, [item.id]);

  function handleSubmit(value) {
    const used = Date.now() - mountTimeRef.current;
    const correct = normalizeArabic(value) === normalizeArabic(item.correctAnswer);
    onFinish(correct ? 100 : 0, value, { elapsedMs: used });
  }

  return (
    <>
      <div className="emojiBig" aria-label={`انتبه لرمز: ${item.stimulus.label}`}>
        <span aria-hidden="true">{item.stimulus.icon}</span>
      </div>
      <Choice
        choices={item.choices}
        selected={selected}
        onSelect={setSelected}
        onSubmit={handleSubmit}
      />
    </>
  );
}
export default ReactionChoice;
