import React, { useState, useCallback, useRef } from "react";
import { adaptiveScore } from "../../utils/scoring.js";
import { normalizeArabic } from "../../utils/arabic.js";
import { speak, stop, isTTSAvailable } from "../../utils/speech.js";
import { TTSButton } from "../ui/TTSButton.jsx";

// Import question sub-components
import { Choice } from "./Choice.jsx";
import { ImageChoice } from "./ImageChoice.jsx";
import { ColorChoice } from "./ColorChoice.jsx";
import { MultiSelect } from "./MultiSelect.jsx";
import { OrderedTap } from "./OrderedTap.jsx";
import { VisualMemory } from "./VisualMemory.jsx";
import { MemorySpan } from "./MemorySpan.jsx";
import { TextInput } from "./TextInput.jsx";
import { TimedNaming } from "./TimedNaming.jsx";
import { ReactionChoice } from "./ReactionChoice.jsx";
import { TimedReading } from "./TimedReading.jsx";
import { SpeechReading } from "./SpeechReading.jsx";

export function Question({ item, moduleId, onAnswer, viewMode }) {
  const [selected, setSelected] = useState("");
  const [multi, setMulti] = useState([]);
  const [sequence, setSequence] = useState([]);
  const [start] = useState(Date.now());
  const [isSpeaking, setIsSpeaking] = useState(false);

  const ttsAvailable = isTTSAvailable();
  const spokenText = item.spokenPrompt || item.prompt;

  function handleSpeak() {
    if (isSpeaking) {
      stop();
      setIsSpeaking(false);
      return;
    }
    setIsSpeaking(true);
    speak(spokenText, {
      rate: 0.82,
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
    });
  }

  function finish(accuracyScore, answer, extra = {}) {
    const responseTimeMs = extra.elapsedMs || (Date.now() - start);
    const scored = adaptiveScore(item, accuracyScore, responseTimeMs, extra);
    onAnswer({
      moduleId,
      itemId: item.id,
      domain: item.domain,
      skill: item.skill,
      type: item.type,
      difficulty: item.difficulty,
      prompt: item.prompt,
      selectedAnswer: answer,
      correctAnswer:
        item.correctAnswer ||
        item.correctSequence ||
        item.correctIndexes ||
        item.sequence ||
        null,
      score: scored.score,
      isCorrect: scored.score >= 70,
      responseTimeMs,
      scoring: scored,
      timestamp: new Date().toISOString(),
      ...extra,
    });
  }

  function submitChoice(val = selected) {
    const isCorrect = normalizeArabic(val) === normalizeArabic(item.correctAnswer);
    finish(isCorrect ? 100 : 0, val);
  }

  function submitMulti() {
    const correct = new Set(item.correctIndexes);
    const picked = new Set(multi);
    const falsePositiveCount = multi.filter((x) => !correct.has(x)).length;
    const missingCount = item.correctIndexes.filter((x) => !picked.has(x)).length;
    let points = 0;
    item.grid.forEach((_, i) => {
      if (correct.has(i) === picked.has(i)) points += 1;
    });
    finish((points / item.grid.length) * 100, multi, { falsePositiveCount, missingCount });
  }

  function submitSequence() {
    let points = 0;
    item.correctSequence.forEach((value, i) => {
      if (normalizeArabic(sequence[i]) === normalizeArabic(value)) points += 1;
    });
    const lengthPenalty = Math.abs(sequence.length - item.correctSequence.length) * 12;
    const score = Math.max(0, (points / item.correctSequence.length) * 100 - lengthPenalty);
    finish(score, sequence, { sequenceLength: sequence.length });
  }

  return (
    <div className="question">
      {/* ── Question header row ── */}
      <div className="qTop">
        <span>🎯 نشاط</span>
        {viewMode === "therapist" && <span>صعوبة {item.difficulty}</span>}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "var(--spacing-md)" }}>
        <h3 style={{ margin: 0 }}>{item.prompt}</h3>
        <TTSButton
          text={spokenText}
          isSpeaking={isSpeaking}
          onSpeak={handleSpeak}
          onStop={handleSpeak}
          isSupported={ttsAvailable}
          label="استمع للسؤال"
          labelText="اسمع"
          size="sm"
          variant="pill"
        />
      </div>


      {item.type === "imageChoice" && (
        <ImageChoice choices={item.choices} selected={selected} onSelect={setSelected} onSubmit={submitChoice} />
      )}
      {item.type === "choice" && (
        <Choice choices={item.choices} selected={selected} onSelect={setSelected} onSubmit={submitChoice} />
      )}
      {item.type === "colorChoice" && (
        <ColorChoice choices={item.choices} selected={selected} onSelect={setSelected} onSubmit={submitChoice} />
      )}
      {item.type === "multiSelect" && (
        <MultiSelect
          grid={item.grid}
          selected={multi}
          onToggle={(index) =>
            setMulti((old) => old.includes(index) ? old.filter((n) => n !== index) : [...old, index])
          }
          onSubmit={submitMulti}
        />
      )}
      {item.type === "orderedTap" && (
        <OrderedTap
          choices={item.choices}
          sequence={sequence}
          onAdd={(val) => setSequence((old) => [...old, val])}
          onClear={() => setSequence([])}
          onSubmit={submitSequence}
        />
      )}
      {item.type === "visualMemory"   && <VisualMemory  item={item} onFinish={finish} />}
      {item.type === "memorySpan"     && <MemorySpan    item={item} onFinish={finish} />}
      {item.type === "textInput"      && <TextInput      item={item} onFinish={finish} />}
      {item.type === "timedNaming"    && <TimedNaming    item={item} onFinish={finish} />}
      {item.type === "reactionChoice" && <ReactionChoice item={item} onFinish={finish} />}
      {item.type === "timedReading"   && <TimedReading   item={item} onFinish={finish} />}
      {item.type === "speechReading"  && <SpeechReading  item={item} onFinish={finish} />}
    </div>
  );
}
export default Question;
