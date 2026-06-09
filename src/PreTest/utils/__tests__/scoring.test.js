import { describe, it, expect } from "vitest";
import {
  clamp,
  avg,
  expectedTime,
  adaptiveScore,
  parentRisk,
  computeResults,
  makePlan,
} from "../scoring.js";

describe("Scoring Mathematical Utilities", () => {
  it("clamp should restrict values between 0 and 100", () => {
    expect(clamp(-5)).toBe(0);
    expect(clamp(45.6)).toBe(46);
    expect(clamp(120)).toBe(100);
  });

  it("avg should calculate average of numbers and ignore non-finite elements", () => {
    expect(avg([10, 20, 30])).toBe(20);
    expect(avg([10, null, 20, undefined, 30])).toBe(20);
    expect(avg([])).toBeNull();
  });
});

describe("Expected Time per Task Type", () => {
  it("should return the correct default expected times", () => {
    expect(expectedTime({ type: "choice" })).toBe(4500);
    expect(expectedTime({ type: "imageChoice" })).toBe(4200);
    expect(expectedTime({ type: "reactionChoice", idealTimeMs: 2000 })).toBe(2000);
    expect(expectedTime({ type: "unknown" })).toBe(6000);
  });
});

describe("Adaptive Score Calculation", () => {
  it("should compute composite score with accuracy, speed, and difficulty factors", () => {
    const item = { domain: "phonological", difficulty: 2, type: "choice" };
    // expectedTime = 4500. Speed score for 4500ms response = 100.
    // difficultyBonus = (2-1)*3 = 3.
    // Phonological weights: accuracy: 0.9, speed: 0.1
    // Score = 100 * 0.9 + 100 * 0.1 + 3 = 103 -> clamped to 100
    const res = adaptiveScore(item, 100, 4500);
    expect(res.score).toBe(100);
    expect(res.accuracyScore).toBe(100);
    expect(res.speedScore).toBe(100);
    expect(res.difficultyBonus).toBe(3);
  });

  it("should apply penalties for errors, missing choices, and false positives", () => {
    const item = { domain: "orthographic", difficulty: 1, type: "multiSelect" };
    // orthographic weights: accuracy: 0.8, speed: 0.2
    // expectedTime = 9000. 9000ms response -> speedScore = 100.
    // Score = 80 * 0.8 + 100 * 0.2 + 0 = 84.
    // Penalties: falsePositiveCount = 1 (-10), missingCount = 1 (-8) -> 84 - 18 = 66
    const res = adaptiveScore(item, 80, 9000, {
      falsePositiveCount: 1,
      missingCount: 1,
    });
    expect(res.score).toBe(66);
  });
});

describe("Parental Intake Questionnaire Risk Assessment", () => {
  it("should accumulate risk from affirmative answers", () => {
    const intake1 = {
      familyHistory: "yes",
      avoidsReading: "yes",
      spellingStruggle: "no",
      slowReading: "unknown",
    };
    expect(parentRisk(intake1)).toBe(50);

    const intake2 = {
      familyHistory: "no",
      avoidsReading: "no",
      spellingStruggle: "no",
      slowReading: "no",
    };
    expect(parentRisk(intake2)).toBe(0);
  });
});

describe("Results Computation and Treatment Planning", () => {
  const responses = [
    { domain: "phonological", score: 80, skill: "rhyme" },
    { domain: "phonological", score: 90, skill: "blending" },
    { domain: "orthographic", score: 50, skill: "visual_scanning" },
    { domain: "rapidNaming", score: 75, skill: "object_naming" },
    { domain: "decoding", score: 40, skill: "word_to_picture" },
    { domain: "spellingMemory", score: 30, skill: "simple_spelling" },
  ];
  
  const safety = { hearingIssue: false, visionIssue: false };
  const intake = { familyHistory: "yes", avoidsReading: "no", spellingStruggle: "no", slowReading: "no" };

  it("should compute global assessment reports correctly", () => {
    const results = computeResults(responses, safety, intake);
    expect(results.domainScores.phonological).toBe(85);
    expect(results.domainScores.orthographic).toBe(50);
    expect(results.domainScores.spellingMemory).toBe(30);
    expect(results.questionnaireRisk).toBe(25);
    // orthographic, decoding, spellingMemory are under 60
    expect(results.weakDomains).toContain("orthographic");
    expect(results.weakDomains).toContain("decoding");
    expect(results.weakDomains).toContain("spellingMemory");
  });

  it("should formulate custom training plan based on weak domains", () => {
    const results = computeResults(responses, safety, intake);
    const plan = makePlan(results.domainScores);
    
    expect(plan.length).toBe(3); // orthographic, decoding, spellingMemory should trigger adventures
    expect(plan[0].domain).toBe("orthographic");
    expect(plan[0].level).toBe(2); // score 50 is level 2
    expect(plan[2].domain).toBe("spellingMemory");
    expect(plan[2].level).toBe(1); // score 30 is level 1
  });
});
