import { create } from "zustand";

import { statsService } from "../features/stats/services/stats.service";
import { BasicStats, DashboardStats } from "../types/stats.types";

type StatsState = {
  dashboard: DashboardStats | null;
  basic: BasicStats | null;
  basicRange: "7d" | "30d";
  isDashboardLoading: boolean;
  isBasicLoading: boolean;
  dashboardError: string | null;
  basicError: string | null;
  fetchDashboard: () => Promise<void>;
  fetchBasic: (range: "7d" | "30d") => Promise<void>;
  reset: () => void;
};

export const useStatsStore = create<StatsState>((set) => ({
  dashboard: null,
  basic: null,
  basicRange: "7d",
  isDashboardLoading: false,
  isBasicLoading: false,
  dashboardError: null,
  basicError: null,
  fetchDashboard: async () => {
    set({ isDashboardLoading: true, dashboardError: null });
    try {
      const dashboard = await statsService.getDashboard();
      set({ dashboard, isDashboardLoading: false });
    } catch (error) {
      set({
        isDashboardLoading: false,
        dashboardError:
          error instanceof Error ? error.message : "Dashboard verileri alınamadı."
      });
    }
  },
  fetchBasic: async (range) => {
    set({ isBasicLoading: true, basicError: null, basicRange: range });
    try {
      const basic = await statsService.getBasic(range);
      set({ basic, isBasicLoading: false });
    } catch (error) {
      set({
        isBasicLoading: false,
        basicError: error instanceof Error ? error.message : "İstatistik verileri alınamadı."
      });
    }
  },
  reset: () =>
    set({
      dashboard: null,
      basic: null,
      basicRange: "7d",
      isDashboardLoading: false,
      isBasicLoading: false,
      dashboardError: null,
      basicError: null
    })
}));
