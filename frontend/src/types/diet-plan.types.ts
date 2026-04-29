export type DietPlanStatus = "active" | "archived";
export type MealAppliesToType = "every_day" | "selected_dates";

export interface MealItem {
  mealId: string;
  name: string;
  time: string;
  note?: string;
  order: number;
  appliesToType: MealAppliesToType;
  appliesToDates?: string[];
}

export interface DietPlan {
  id: string;
  userId: string;
  title: string;
  weekStartDate: string;
  weekEndDate: string;
  status: DietPlanStatus;
  version: number;
  notes?: string;
  meals: MealItem[];
  scheduleKey: string;
  createdAt: string;
  updatedAt: string;
}

export interface MealInput {
  mealId?: string;
  name: string;
  time: string;
  note?: string;
  order: number;
  appliesToType: MealAppliesToType;
  appliesToDates?: string[];
}

export interface CreateDietPlanInput {
  title: string;
  weekStartDate: string;
  weekEndDate: string;
  notes?: string;
  meals: MealInput[];
  activateNow?: boolean;
}

export interface UpdateDietPlanInput {
  title?: string;
  weekStartDate?: string;
  weekEndDate?: string;
  notes?: string;
  meals?: MealInput[];
}

export interface UpdateMealInput {
  name?: string;
  time?: string;
  note?: string;
  order?: number;
  appliesToType?: MealAppliesToType;
  appliesToDates?: string[];
}

export interface ActivateDietPlanResult {
  activePlan: DietPlan;
  previousActivePlanId: string | null;
  requiresNotificationReschedule: true;
}
