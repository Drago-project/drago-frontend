// src/data/stories.js

export const STORY_DATA = [
  {
    id: 1,
    text: "Drago found a boat near the river.",
    question: "What did Drago find?",
    options: [
      { id: "a", text: "A Car", emoji: "🚗", isCorrect: false },
      { id: "b", text: "A Boat", emoji: "🛶", isCorrect: true },
    ],
  },
  {
    id: 2,
    text: "The river flows very fast towards the waterfall.",
    question: "Where does the river go?",
    options: [
      { id: "a", text: "Waterfall", emoji: "🌊", isCorrect: true },
      { id: "b", text: "Desert", emoji: "🌵", isCorrect: false },
    ],
  },
  {
    id: 3,
    text: "Drago needs to paddle to stay safe.",
    question: "What should Drago do?",
    options: [
      { id: "a", text: "Sleep", emoji: "😴", isCorrect: false },
      { id: "b", text: "Paddle", emoji: "🚣", isCorrect: true },
    ],
  },
];
