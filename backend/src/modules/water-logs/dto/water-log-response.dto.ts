export interface WaterLogResponseDto {
  id: string;
  userId: string;
  amountMl: number;
  loggedAt: string;
  source: "manual" | "quickAdd";
  createdAt: string;
  updatedAt: string;
}

export interface WaterDailySummaryResponseDto {
  date: string;
  totalConsumedMl: number;
  logCount: number;
  logs: WaterLogResponseDto[];
}

export interface WaterRangeSummaryResponseDto {
  from: string;
  to: string;
  totalConsumedMl: number;
  logCount: number;
  dailyTotals: Array<{
    date: string;
    totalConsumedMl: number;
  }>;
}
