export type WaterLogSource = "manual" | "quickAdd";

export interface WaterLog {
  id: string;
  userId: string;
  amountMl: number;
  loggedAt: string;
  source: WaterLogSource;
  createdAt: string;
  updatedAt: string;
}

export interface WaterDailySummary {
  date: string;
  totalConsumedMl: number;
  logCount: number;
  logs: WaterLog[];
}

export interface WaterRangeSummary {
  from: string;
  to: string;
  totalConsumedMl: number;
  logCount: number;
  dailyTotals: Array<{
    date: string;
    totalConsumedMl: number;
  }>;
}
