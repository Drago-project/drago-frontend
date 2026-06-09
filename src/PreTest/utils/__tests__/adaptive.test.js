import { describe, it, expect } from "vitest";
import { adaptiveNextIndex } from "../adaptive.js";

describe("Adaptive Pathway Testing Logic", () => {
  const questionList = [
    { id: "q1", difficulty: 1 },
    { id: "q2", difficulty: 1 },
    { id: "q3", difficulty: 2 },
    { id: "q4", difficulty: 2 },
    { id: "q5", difficulty: 3 },
  ];

  it("should advance to next item sequentially by default", () => {
    const moduleResponses = [{ score: 70 }];
    const decision = adaptiveNextIndex({
      questionList,
      currentIndex: 0,
      moduleResponses,
    });
    
    expect(decision.stop).toBe(false);
    expect(decision.nextIndex).toBe(1);
  });

  it("should escalate difficulty if last two responses are very strong", () => {
    // Current difficulty is 1. If last two are >= 85, jump to difficulty 2 (which is index 2 or 3)
    const moduleResponses = [{ score: 90 }, { score: 95 }];
    const decision = adaptiveNextIndex({
      questionList,
      currentIndex: 1,
      moduleResponses,
    });
    
    expect(decision.stop).toBe(false);
    expect(decision.nextIndex).toBe(2); // Jumped to index 2 (difficulty 2) instead of index 2 sequentially
  });

  it("should downgrade difficulty if last two responses are weak", () => {
    // Current difficulty is 2 (index 2). If last two are < 50, jump to an easier index (difficulty <= 2, i.e. index 3 or index 4)
    const moduleResponses = [{ score: 40 }, { score: 35 }];
    const decision = adaptiveNextIndex({
      questionList,
      currentIndex: 2,
      moduleResponses,
    });
    
    expect(decision.stop).toBe(false);
    // Sequence search continues. Index 3 is difficulty 2 (easier or equal difficulty).
    expect(decision.nextIndex).toBe(3);
  });

  it("should trigger Early Stop on high confidence strong", () => {
    // At least 4 responses, recent 3 average >= 90
    const moduleResponses = [
      { score: 60 },
      { score: 95 },
      { score: 90 },
      { score: 92 },
    ];
    const decision = adaptiveNextIndex({
      questionList,
      currentIndex: 3,
      moduleResponses,
    });
    
    expect(decision.stop).toBe(true);
    expect(decision.reason).toBe("high_confidence_strong");
  });

  it("should trigger Early Stop on high confidence needs support", () => {
    // At least 4 responses, recent 3 average < 35
    const moduleResponses = [
      { score: 80 },
      { score: 30 },
      { score: 20 },
      { score: 30 },
    ];
    const decision = adaptiveNextIndex({
      questionList,
      currentIndex: 3,
      moduleResponses,
    });
    
    expect(decision.stop).toBe(true);
    expect(decision.reason).toBe("high_confidence_needs_support");
  });

  it("should stop naturally when all questions are exhausted", () => {
    const moduleResponses = [{ score: 70 }, { score: 70 }, { score: 70 }];
    const decision = adaptiveNextIndex({
      questionList,
      currentIndex: 4,
      moduleResponses,
    });
    
    expect(decision.stop).toBe(true);
    expect(decision.reason).toBe("module_finished");
  });
});
