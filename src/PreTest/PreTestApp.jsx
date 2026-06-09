import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./PreTestStyles.css"; // ملف الـ CSS اللي غيرنا اسمه
import "./styles/app.css";

// Import hooks
import { useLocalStorage } from "./hooks/useLocalStorage.js";

// Import data
import { flow, intakeDefaults, safetyDefaults } from "./data/flow.js";
import { questions } from "./data/questions.js";

// Import utils
import { adaptiveNextIndex } from "./utils/adaptive.js";
import { warmUpSTT } from "./utils/speechToText.js";

// Import layouts and screens
import { Header } from "./components/layout/Header.jsx";
import { Timeline } from "./components/layout/Timeline.jsx";
import { Feedback } from "./components/ui/Feedback.jsx";
import { Welcome } from "./components/screens/Welcome.jsx";

import { Onboarding } from "./components/screens/Onboarding.jsx";
import { Safety } from "./components/screens/Safety.jsx";
import { Mission } from "./components/screens/Mission.jsx";
import { Results } from "./components/screens/Results.jsx";

// غيرنا الاسم هنا لـ PreTestApp
export default function PreTestApp() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [intake, setIntake] = useState(intakeDefaults);
  const [safety, setSafety] = useState(safetyDefaults);
  const [responses, setResponses] = useState([]);
  const [stars, setStars] = useState(0);
  const [viewMode, setViewMode] = useState("child");
  const [feedback, setFeedback] = useState(null);

  const states = {
    step,
    questionIndex,
    intake,
    safety,
    responses,
    stars,
    viewMode,
  };
  const setters = {
    step: setStep,
    questionIndex: setQuestionIndex,
    intake: setIntake,
    safety: setSafety,
    responses: setResponses,
    stars: setStars,
    viewMode: setViewMode,
  };

  const { restoreSaved, clearSaved, hasSaved } = useLocalStorage(
    states,
    setters,
  );

  // Pre-warm the HuggingFace STT connection on mount
  useEffect(() => {
    warmUpSTT();
  }, []);

  const current = flow[step];
  const totalQuestions = Object.values(questions).reduce(
    (sum, list) => sum + list.length,
    0,
  );
  const progress = Math.min(
    100,
    Math.round((responses.length / Math.max(1, totalQuestions)) * 100),
  );

  function next() {
    setQuestionIndex(0);
    setStep((s) => Math.min(s + 1, flow.length - 1));
    setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 20);
  }

  function back() {
    setQuestionIndex(0);
    setStep((s) => Math.max(s - 1, 0));
  }

  function answer(response) {
    const scoreStars = response.score >= 75 ? 2 : response.score >= 45 ? 1 : 0;
    const currentList = questions[current.id];
    const updatedResponses = [...responses, response];
    setResponses(updatedResponses);
    setStars((old) => old + scoreStars);
    setFeedback({ score: response.score, stars: scoreStars });

    setTimeout(() => {
      setFeedback(null);
      const moduleResponses = updatedResponses.filter(
        (r) => r.moduleId === current.id,
      );
      const decision = adaptiveNextIndex({
        questionList: currentList,
        currentIndex: questionIndex,
        moduleResponses,
      });
      if (decision.stop) {
        next();
      } else {
        setQuestionIndex(decision.nextIndex);
      }
    }, 550);
  }

  function restart() {
    setStep(0);
    setQuestionIndex(0);
    setResponses([]);
    setStars(0);
    setSafety(safetyDefaults);
    clearSaved();
  }

  function finishPreTest() {
    localStorage.removeItem("needsPretest");
    navigate("/home", { replace: true });
  }

  return (
    <div className="app" dir="rtl">
      <Header
        current={current}
        progress={progress}
        stars={stars}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      {feedback && <Feedback score={feedback.score} stars={feedback.stars} />}

      <div
        className={
          viewMode === "therapist"
            ? "layout therapistLayout"
            : "layout childLayout"
        }
      >
        <main>
          {current.kind === "welcome" && (
            <Welcome
              onNext={next}
              hasSaved={hasSaved}
              onResume={restoreSaved}
              onClearSaved={restart}
            />
          )}
          {current.kind === "onboarding" && (
            <Onboarding intake={intake} setIntake={setIntake} onNext={next} />
          )}
          {current.kind === "safety" && (
            <Safety
              safety={safety}
              setSafety={setSafety}
              onNext={next}
              onBack={back}
            />
          )}
          {current.kind === "module" && (
            <Mission
              id={current.id}
              index={questionIndex}
              onAnswer={answer}
              onBack={back}
              viewMode={viewMode}
            />
          )}
          {current.kind === "results" && (
            <Results
              intake={intake}
              safety={safety}
              responses={responses}
              stars={stars}
              viewMode={viewMode}
              onRestart={restart}
              onFinish={finishPreTest}
            />
          )}
        </main>

        {viewMode === "therapist" && <Timeline step={step} />}
      </div>
    </div>
  );
}
