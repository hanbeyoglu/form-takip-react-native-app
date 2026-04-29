export interface DashboardStatsResponseDto {
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
