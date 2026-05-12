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
  // Parse as local date to avoid UTC timezone shift.
  // Accepts "YYYY-MM-DD" or a longer ISO/timestamp string; only the date part is used.
  const datePart = programStartDate.slice(0, 10);
  const [year, month, day] = datePart.split("-").map(Number);
  const result = new Date(year, month - 1, day);
  const offsetDays = (week - 1) * 7 + dayIndex;
  result.setDate(result.getDate() + offsetDays);
  return result;
}

/**
 * Short, friendly date format like "May 11".
 */
export function formatLogDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}
