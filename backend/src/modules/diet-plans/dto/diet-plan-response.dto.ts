export interface MealResponseDto {
  mealId: string;
  name: string;
  time: string;
  note?: string;
  order: number;
  appliesToType: "every_day" | "selected_dates";
  appliesToDates?: string[];
}

export interface DietPlanResponseDto {
  id: string;
  userId: string;
  title: string;
  weekStartDate: string;
  weekEndDate: string;
  status: "active" | "archived";
  version: number;
  notes?: string;
  meals: MealResponseDto[];
  scheduleKey: string;
  createdAt: string;
  updatedAt: string;
}

export interface ActivateDietPlanResponseDto {
  activePlan: DietPlanResponseDto;
  previousActivePlanId: string | null;
  requiresNotificationReschedule: true;
}
