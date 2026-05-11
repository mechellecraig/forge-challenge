// Helpers for converting (week, day_index) pairs into calendar dates.
// day_index: 0 = Monday, 6 = Sunday (matches the DAYS array in LogActivity).

/**
 * Convert a (week, day_index) pair to a calendar Date, given the program start.
 * Week 1 / day_index 0 = the program start date.
 */
export function weekDayToDate(
  programStartDate: string,
  week: number,
  dayIndex: number,
): Date {
  const start = new Date(programStartDate);
  const offsetDays = (week - 1) * 7 + dayIndex;
  const result = new Date(start);
  result.setDate(start.getDate() + offsetDays);
  return result;
}

/**
 * Short, friendly date format like "Tue Nov 11".
 */
export function formatLogDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}
