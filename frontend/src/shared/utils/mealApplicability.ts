import { MealAppliesToType, MealItem, MealInput } from "../../types/diet-plan.types";

export type MealApplicabilityLike = Pick<MealItem | MealInput, "appliesToType" | "appliesToDates">;

export function getLocalDateRange(startDateString: string, endDateString: string): string[] {
  const startDate = new Date(`${startDateString}T00:00:00`);
  const endDate = new Date(`${endDateString}T00:00:00`);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime()) || endDate < startDate) {
    return [];
  }

  const dates: string[] = [];
  const cursor = new Date(startDate);
  while (cursor.getTime() <= endDate.getTime()) {
    dates.push(formatLocalDate(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
}

export function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function mealAppliesOnDate(
  meal: MealApplicabilityLike,
  dateString: string
): boolean {
  const appliesToType: MealAppliesToType = meal.appliesToType ?? "every_day";
  if (appliesToType === "every_day") {
    return true;
  }
  return (meal.appliesToDates ?? []).includes(dateString);
}

export function getMealApplicableDates(
  meal: MealApplicabilityLike,
  weekStartDate: string,
  weekEndDate: string
): string[] {
  const planDates = getLocalDateRange(weekStartDate, weekEndDate);
  if ((meal.appliesToType ?? "every_day") === "every_day") {
    return planDates;
  }
  const selected = meal.appliesToDates ?? [];
  return planDates.filter((date) => selected.includes(date));
}

export function formatReadablePlanDate(dateString: string, locale = "tr"): string {
  const date = new Date(`${dateString}T00:00:00`);
  return date.toLocaleDateString(locale, {
    day: "numeric",
    month: "long",
    weekday: "short"
  });
}
