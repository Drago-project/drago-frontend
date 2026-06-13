export function unlockGamesProgress(domainScores) {
  if (!domainScores) return;

  const gameMappings = [
    {
      key: "volcano_words_progress",
      domain: "phonological",
      maxLevels: 6,
    },
    {
      key: "word_hunt_progress",
      domain: "orthographic",
      maxLevels: 6,
    },
    {
      key: "tomb_puzzle_progress",
      domain: "spellingMemory",
      maxLevels: 6,
    },
    {
      key: "reading_quest_progress",
      domain: "decoding",
      maxLevels: 4,
    },
  ];

  gameMappings.forEach(({ key, domain, maxLevels }) => {
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

    localStorage.setItem(key, JSON.stringify(progress));
  });
}
