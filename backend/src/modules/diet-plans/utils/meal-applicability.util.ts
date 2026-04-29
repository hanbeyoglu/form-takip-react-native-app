export type MealApplicabilityLike = {
  appliesToType?: "every_day" | "selected_dates";
  appliesToDates?: string[];
};

export function getUtcDateRange(startDateString: string, endDateString: string): string[] {
  const startDate = new Date(`${startDateString}T00:00:00.000Z`);
  const endDate = new Date(`${endDateString}T00:00:00.000Z`);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime()) || endDate < startDate) {
    return [];
  }

  const dates: string[] = [];
  const cursor = new Date(startDate);
  while (cursor.getTime() <= endDate.getTime()) {
    dates.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return dates;
}

export function mealAppliesOnDate(
  meal: MealApplicabilityLike,
  dateString: string
): boolean {
  if ((meal.appliesToType ?? "every_day") === "every_day") {
    return true;
  }
  return (meal.appliesToDates ?? []).includes(dateString);
}
