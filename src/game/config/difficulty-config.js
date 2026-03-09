import { deepFreeze } from "../../core/utils/deep-freeze.js";

const EASY = deepFreeze({
  id: 'easy',

  targeting: {
    canTarget: false,
    accuracy: 0,
  },

  memory: {
    rememberShots: false,
    maxMissTolerance: 0,
  },

  timing: {
    minDelayMs: 250,
    maxDelayMs: 450,
  },
});


const NORMAL = deepFreeze({
  id: 'normal',

  targeting: {
    canTarget: true,
    accuracy: 0.75,
  },

  memory: {
    rememberShots: true,
    maxMissTolerance: 2,
  },

  timing: {
    minDelayMs: 300,
    maxDelayMs: 600,
  },
});

const HARD = deepFreeze({
  id: 'hard',

  targeting: {
    canTarget: true,
    accuracy: 1,
  },

  memory: {
    rememberShots: true,
    maxMissTolerance: Infinity,
  },

  timing: {
    minDelayMs: 600,
    maxDelayMs: 800,
  },
});

export const DIFFICULTY = Object.freeze({EASY, NORMAL, HARD});