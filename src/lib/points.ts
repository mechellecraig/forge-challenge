export const DEFAULT_SCORING = {
  walk: 3,
  run: 3,
  bike: 1,
  meal_weekday: 3,
  meal_weekend: 5,
  hr_zone: 5,
  hr_threshold: 0.75,
};

export type ScoringConfig = typeof DEFAULT_SCORING;

export function calcDayPoints(log: {
  walk: number; run: number; bike: number;
  meal_plan: boolean; avg_hr: number;
  day_index: number; age: number;
}, scoring: ScoringConfig = DEFAULT_SCORING): number {
  let pts = 0;
  pts += log.walk * scoring.walk;
  pts += log.run * scoring.run;
  pts += log.bike * scoring.bike;
  if (log.meal_plan) pts += log.day_index >= 5 ? scoring.meal_weekend : scoring.meal_weekday;
  if (log.avg_hr > 0 && log.age > 0) {
    if (log.avg_hr >= (220 - log.age) * scoring.hr_threshold) pts += scoring.hr_zone;
  }
  return pts;
}
