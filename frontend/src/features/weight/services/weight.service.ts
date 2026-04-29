import { apiClient } from "../../../services/api/client";
import { WeightLog } from "../../../types/weight.types";

export class WeightService {
  addLog(payload: { weightKg: number; loggedAt: string; note?: string }): Promise<WeightLog> {
    return apiClient.postData<WeightLog, typeof payload>("/weight-logs", payload);
  }

  getLogs(from: string, to: string): Promise<WeightLog[]> {
    return apiClient.getData<WeightLog[]>(`/weight-logs?from=${from}&to=${to}`);
  }
}

export const weightService = new WeightService();
