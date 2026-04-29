import { apiClient } from "../../../services/api/client";
import { BasicStats, DashboardStats } from "../../../types/stats.types";

export class StatsService {
  getDashboard(): Promise<DashboardStats> {
    return apiClient.getData<DashboardStats>("/stats/dashboard");
  }

  getBasic(range: "7d" | "30d"): Promise<BasicStats> {
    return apiClient.getData<BasicStats>(`/stats/basic?range=${range}`);
  }
}

export const statsService = new StatsService();
