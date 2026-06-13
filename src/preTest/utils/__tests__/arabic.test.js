import { describe, it, expect } from "vitest";
import { normalizeArabic, levenshtein, fuzzyScore } from "../arabic.js";

describe("Arabic Text Normalization", () => {
  it("should strip harakat (diacritics)", () => {
    expect(normalizeArabic("كِتَابٌ")).toBe("كتاب");
    expect(normalizeArabic("بَيْتٌ")).toBe("بيت");
    expect(normalizeArabic("مَدْرَسَةٌ")).toBe("مدرسه");
  });

  it("should normalize hamzas to bare alef", () => {
    expect(normalizeArabic("أحمد")).toBe("احمد");
    expect(normalizeArabic("إسماعيل")).toBe("اسماعيل");
    expect(normalizeArabic("آدم")).toBe("ادم");
  });

  it("should normalize alef maqsura to ya", () => {
    expect(normalizeArabic("على")).toBe("علي");
    expect(normalizeArabic("مستشفى")).toBe("مستشفي");
  });

  it("should normalize ta marbuta to ha", () => {
    expect(normalizeArabic("قطة")).toBe("قطه");
    expect(normalizeArabic("شجرة")).toBe("شجره");
  });

  it("should strip tatweel (kashida)", () => {
    expect(normalizeArabic("كـتـاب")).toBe("كتاب");
    expect(normalizeArabic("بـيـت")).toBe("بيت");
  });

  it("should trim and collapse whitespaces", () => {
    expect(normalizeArabic("  جلس   عمر   ")).toBe("جلس عمر");
  });
});

describe("Levenshtein Distance", () => {
  it("should return 0 for identical normalized strings", () => {
    expect(levenshtein("شمس", "شمس")).toBe(0);
    expect(levenshtein("بَيْت", "بيت")).toBe(0);
  });

  it("should calculate edit distance accurately", () => {
    expect(levenshtein("بيت", "بنت")).toBe(1);
    expect(levenshtein("كتاب", "كاتب")).toBe(2);
    expect(levenshtein("قمر", "شمس")).toBe(2);
  });
});

describe("Fuzzy Scoring", () => {
  it("should return 100 for perfect match", () => {
    expect(fuzzyScore("موز", "مَوْز")).toBe(100);
  });

  it("should return 0 for empty or entirely different inputs", () => {
    expect(fuzzyScore("", "كتاب")).toBe(0);
    expect(fuzzyScore("ولد", "تفاحة")).toBe(0);
  });

  it("should return accurate relative similarity score", () => {
    // Levenshtein distance = 1, Max length = 4 -> 1 - 1/4 = 75%
    expect(fuzzyScore("كتاب", "كتب")).toBe(75);
  });
});
