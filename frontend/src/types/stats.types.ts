export interface DashboardStats {
  activePlan: {
    id: string;
    title: string;
    weekStartDate: string;
    weekEndDate: string;
    status: "active" | "archived";
  } | null;
  todayMealCount: number;
  dailyWaterTargetMl: number;
  todayWaterConsumedMl: number;
  latestWeight: {
    weightKg: number;
    loggedAt: string;
  } | null;
  waterProgressPercent: number;
}

export interface BasicStats {
  range: "7d" | "30d";
  from: string;
  to: string;
  totalWaterLogs: number;
  averageDailyWaterMl: number;
  waterGoalHitDays: number;
  firstWeightInRange: number | null;
  latestWeightInRange: number | null;
  weightChangeInRange: number | null;
}
