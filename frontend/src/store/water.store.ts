import { create } from "zustand";

import { waterService } from "../features/water/services/water.service";
import { useStatsStore } from "./stats.store";
import { WaterDailySummary } from "../types/water.types";

type WaterState = {
  daily: WaterDailySummary | null;
  isLoading: boolean;
  error: string | null;
  fetchDaily: (date?: string) => Promise<void>;
  quickAdd: (amountMl: number) => Promise<void>;
  addManual: (amountMl: number) => Promise<void>;
  clearError: () => void;
  reset: () => void;
};

function todayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

export const useWaterStore = create<WaterState>((set, get) => ({
  daily: null,
  isLoading: false,
  error: null,
  fetchDaily: async (date = todayDateString()) => {
    set({ isLoading: true, error: null });
    try {
      const daily = await waterService.getDaily(date);
      set({ daily, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Su verileri alınamadı."
      });
    }
  },
  quickAdd: async (amountMl) => {
    set({ isLoading: true, error: null });
    try {
      await waterService.addLog({
        amountMl,
        loggedAt: new Date().toISOString(),
        source: "quickAdd"
      });
      await Promise.all([get().fetchDaily(), useStatsStore.getState().fetchDashboard()]);
      set({ isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Su kaydı eklenemedi."
      });
      throw error;
    }
  },
  addManual: async (amountMl) => {
    set({ isLoading: true, error: null });
    try {
      await waterService.addLog({
        amountMl,
        loggedAt: new Date().toISOString(),
        source: "manual"
      });
      await Promise.all([get().fetchDaily(), useStatsStore.getState().fetchDashboard()]);
      set({ isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Su kaydı eklenemedi."
      });
      throw error;
    }
  },
  clearError: () => set({ error: null }),
  reset: () => set({ daily: null, isLoading: false, error: null })
}));
