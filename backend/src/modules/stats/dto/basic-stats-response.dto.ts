export interface BasicStatsResponseDto {
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
