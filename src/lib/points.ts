export const POINTS = {
  walk: 3,
  run: 3,
  bike: 1,
  meal_weekday: 3,
  meal_weekend: 5,
  hr_zone: 5,
};

export const HR_THRESHOLD = 0.75;

export function calcDayPoints(log: {
  walk: number; run: number; bike: number;
  meal_plan: boolean; avg_hr: number;
  day_index: number; age: number;
}): number {
  let pts = 0;
  pts += log.walk * POINTS.walk;
  pts += log.run * POINTS.run;
  pts += log.bike * POINTS.bike;
  if (log.meal_plan) pts += log.day_index >= 5 ? POINTS.meal_weekend : POINTS.meal_weekday;
  if (log.avg_hr > 0 && log.age > 0) {
    if (log.avg_hr >= (220 - log.age) * HR_THRESHOLD) pts += POINTS.hr_zone;
  }
  return pts;
}
