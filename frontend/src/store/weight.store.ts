import { create } from "zustand";

import { weightService } from "../features/weight/services/weight.service";
import { useStatsStore } from "./stats.store";
import { WeightLog } from "../types/weight.types";

type WeightState = {
  logs: WeightLog[];
  isLoading: boolean;
  error: string | null;
  fetchLogs: (from?: string, to?: string) => Promise<void>;
  addLog: (payload: { weightKg: number; note?: string }) => Promise<void>;
  clearError: () => void;
  reset: () => void;
};

function defaultFrom(): string {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d.toISOString().slice(0, 10);
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export const useWeightStore = create<WeightState>((set, get) => ({
  logs: [],
  isLoading: false,
  error: null,
  fetchLogs: async (from = defaultFrom(), to = today()) => {
    set({ isLoading: true, error: null });
    try {
      const logs = await weightService.getLogs(from, to);
      set({ logs, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Kilo verileri alınamadı."
      });
    }
  },
  addLog: async ({ weightKg, note }) => {
    set({ isLoading: true, error: null });
    try {
      await weightService.addLog({
        weightKg,
        note,
        loggedAt: new Date().toISOString()
      });
      await Promise.all([get().fetchLogs(), useStatsStore.getState().fetchDashboard()]);
      set({ isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Kilo kaydı eklenemedi."
      });
      throw error;
    }
  },
  clearError: () => set({ error: null }),
  reset: () => set({ logs: [], isLoading: false, error: null })
}));
