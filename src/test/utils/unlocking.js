import { gameProgressAPI } from "../../server/endpoints";
import { getProgressStorageKey } from "../../server/auth";

export async function unlockGamesProgress(userId, domainScores) {
  if (!domainScores || !userId) return;

  const gameMappings = [
    {
      key: "volcano_words_progress",
      gameKey: "volcano_words",
      domain: "phonological",
      maxLevels: 6,
    },
    {
      key: "word_hunt_progress",
      gameKey: "word_hunt",
      domain: "orthographic",
      maxLevels: 6,
    },
    {
      key: "tomb_puzzle_progress",
      gameKey: "tomb_puzzle",
      domain: "spellingMemory",
      maxLevels: 6,
    },
    {
      key: "reading_quest_progress",
      gameKey: "reading_quest",
      domain: "decoding",
      maxLevels: 4,
    },
  ];

  for (const { key, gameKey, domain, maxLevels } of gameMappings) {
    const score = domainScores[domain] ?? 0;

    let recommendedLevel = 1;
    if (score >= 90) {
      recommendedLevel = Math.min(5, maxLevels);
    } else if (score >= 80) {
      recommendedLevel = Math.min(4, maxLevels);
    } else if (score >= 60) {
      recommendedLevel = Math.min(3, maxLevels);
    } else if (score >= 40) {
      recommendedLevel = Math.min(2, maxLevels);
    }

    // Build default empty completedStages and stars maps
    const completedStages = {};
    const stars = {};

    for (let l = 1; l <= maxLevels; l++) {
      const levelKey = String(l);
      completedStages[levelKey] = [false, false, false, false, false];
      stars[levelKey] = [0, 0, 0, 0, 0];
    }

    const progress = {
      unlockedLevel: recommendedLevel,
      recommendedLevel: recommendedLevel,
      recommendedStage: 1,
      showPretestWelcome: true,
      completedStages,
      stars,
      pretestScore: score,
    };

    localStorage.setItem(getProgressStorageKey(key), JSON.stringify(progress));

    // Update backend progress
    try {
      await gameProgressAPI.update(userId, {
        gameKey,
        levelReached: recommendedLevel,
        completedStages: 0,
        starsEarned: 0,
        completionPercent: 0,
      });
    } catch (e) {
      console.error(
        `Failed to initialize backend game progress for ${gameKey}:`,
        e,
      );
    }
  }
}
