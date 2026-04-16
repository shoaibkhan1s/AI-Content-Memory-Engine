import type { ReviewResult } from "@/types/index";

export type Sm2State = {
  interval: number; // days
  easeFactor: number;
  recallStrength: number; // 0..1
  recallCount: number;
};

export type Sm2Update = Sm2State & {
  nextReviewDate: Date;
  strengthDelta: number;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function sm2Update(params: {
  state: Sm2State;
  result: ReviewResult;
  importanceScore: number; // 1..10
  now?: Date;
}): Sm2Update {
  const now = params.now ?? new Date();
  const { result } = params;
  const importance = clamp(params.importanceScore || 5, 1, 10);

  // Map result -> quality (0..5) akin to SM-2
  const q = result === "easy" ? 5 : result === "good" ? 4 : result === "hard" ? 3 : 1;

  let easeFactor = params.state.easeFactor ?? 2.5;
  let interval = params.state.interval ?? 1;
  let recallStrength = params.state.recallStrength ?? 0.5;
  let recallCount = (params.state.recallCount ?? 0) + 1;

  // Ease factor update (SM-2)
  easeFactor = easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  easeFactor = clamp(easeFactor, 1.3, 3.0);

  // Interval update
  if (q < 3) {
    // “forgot” resets schedule
    interval = 1;
    recallStrength = clamp(recallStrength - 0.25, 0, 1);
  } else {
    if (recallCount <= 1) interval = 1;
    else if (recallCount === 2) interval = 3;
    else interval = Math.round(interval * easeFactor);

    const bump = result === "easy" ? 0.15 : result === "good" ? 0.08 : 0.03;
    recallStrength = clamp(recallStrength + bump, 0, 1);
  }

  // Importance weighting: higher importance comes sooner.
  // importance=10 => factor 0.7 ; importance=1 => factor 1.15
  const importanceFactor = clamp(1.2 - importance * 0.05, 0.7, 1.15);
  const weightedInterval = Math.max(1, Math.round(interval * importanceFactor));

  const nextReviewDate = new Date(now.getTime() + weightedInterval * 24 * 60 * 60 * 1000);

  return {
    interval: weightedInterval,
    easeFactor,
    recallStrength,
    recallCount,
    nextReviewDate,
    strengthDelta: recallStrength - (params.state.recallStrength ?? 0.5),
  };
}

