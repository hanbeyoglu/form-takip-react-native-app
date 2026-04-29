import { apiClient } from "../../../services/api/client";
import {
  WaterDailySummary,
  WaterLog,
  WaterRangeSummary
} from "../../../types/water.types";

export class WaterService {
  addLog(payload: {
    amountMl: number;
    loggedAt: string;
    source: "manual" | "quickAdd";
  }): Promise<WaterLog> {
    return apiClient.postData<WaterLog, typeof payload>("/water-logs", payload);
  }

  getDaily(date: string): Promise<WaterDailySummary> {
    return apiClient.getData<WaterDailySummary>(`/water-logs/daily?date=${date}`);
  }

  getRange(from: string, to: string): Promise<WaterRangeSummary> {
    return apiClient.getData<WaterRangeSummary>(`/water-logs/range?from=${from}&to=${to}`);
  }
}

export const waterService = new WaterService();
