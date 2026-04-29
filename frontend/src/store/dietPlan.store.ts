import { create } from "zustand";

import { dietPlanService } from "../features/diet-plan/services/dietPlan.service";
import { notificationPreferencesService } from "../features/notifications/services/notificationPreferences.service";
import { notificationService } from "../services/notification/notification.service";
import {
  CreateDietPlanInput,
  DietPlan,
  MealInput,
  UpdateDietPlanInput,
  UpdateMealInput
} from "../types/diet-plan.types";

async function rescheduleRemindersForPlan(activePlan: DietPlan | null): Promise<void> {
  try {
    const preferences = await notificationPreferencesService.getPreferences();
    const permission = await notificationService.getPermissionStatus();
    if (permission !== "granted") {
      return;
    }
    await notificationService.rescheduleAllReminders(activePlan, preferences);
  } catch {
    // Scheduling hatalari plan akislarini bloklamamali.
  }
}

type DietPlanState = {
  activePlan: DietPlan | null;
  history: DietPlan[];
  selectedPlan: DietPlan | null;
  isLoading: boolean;
  error: string | null;
  fetchActivePlan: () => Promise<void>;
  fetchHistory: () => Promise<void>;
  fetchPlanById: (planId: string) => Promise<void>;
  createPlan: (payload: CreateDietPlanInput) => Promise<DietPlan>;
  updatePlan: (planId: string, payload: UpdateDietPlanInput) => Promise<DietPlan>;
  activatePlan: (planId: string) => Promise<DietPlan>;
  addMeal: (planId: string, payload: MealInput) => Promise<DietPlan>;
  updateMeal: (
    planId: string,
    mealId: string,
    payload: UpdateMealInput
  ) => Promise<DietPlan>;
  deleteMeal: (planId: string, mealId: string) => Promise<DietPlan>;
  clearError: () => void;
  reset: () => void;
};

export const useDietPlanStore = create<DietPlanState>((set, get) => ({
  activePlan: null,
  history: [],
  selectedPlan: null,
  isLoading: false,
  error: null,
  fetchActivePlan: async () => {
    set({ isLoading: true, error: null });
    try {
      const activePlan = await dietPlanService.getActivePlan();
      await rescheduleRemindersForPlan(activePlan);
      set({ activePlan, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Aktif plan alınamadı."
      });
    }
  },
  fetchHistory: async () => {
    set({ isLoading: true, error: null });
    try {
      const history = await dietPlanService.getPlanHistory();
      set({ history, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Geçmiş planlar alınamadı."
      });
    }
  },
  fetchPlanById: async (planId) => {
    set({ isLoading: true, error: null });
    try {
      const selectedPlan = await dietPlanService.getPlanById(planId);
      set({ selectedPlan, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Plan detayı alınamadı."
      });
    }
  },
  createPlan: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const createdPlan = await dietPlanService.createPlan(payload);
      const previousHistory = get().history;
      set({
        isLoading: false,
        activePlan: createdPlan.status === "active" ? createdPlan : get().activePlan,
        history:
          createdPlan.status === "archived"
            ? [createdPlan, ...previousHistory]
            : previousHistory
      });
      if (createdPlan.status === "active") {
        await rescheduleRemindersForPlan(createdPlan);
      }
      return createdPlan;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Plan oluşturulamadı.";
      set({ isLoading: false, error: message });
      throw error;
    }
  },
  updatePlan: async (planId, payload) => {
    set({ isLoading: true, error: null });
    try {
      const updatedPlan = await dietPlanService.updatePlan(planId, payload);
      set((state) => ({
        isLoading: false,
        activePlan:
          state.activePlan?.id === updatedPlan.id ? updatedPlan : state.activePlan,
        selectedPlan:
          state.selectedPlan?.id === updatedPlan.id ? updatedPlan : state.selectedPlan,
        history: state.history.map((plan) =>
          plan.id === updatedPlan.id ? updatedPlan : plan
        )
      }));
      if (updatedPlan.status === "active") {
        await rescheduleRemindersForPlan(updatedPlan);
      }
      return updatedPlan;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Plan güncellenemedi.";
      set({ isLoading: false, error: message });
      throw error;
    }
  },
  activatePlan: async (planId) => {
    set({ isLoading: true, error: null });
    try {
      const activationResult = await dietPlanService.activatePlan(planId);
      const activatedPlan = activationResult.activePlan;
      await Promise.all([get().fetchActivePlan(), get().fetchHistory()]);
      await rescheduleRemindersForPlan(activatedPlan);
      set((state) => ({
        isLoading: false,
        selectedPlan:
          state.selectedPlan?.id === activatedPlan.id
            ? activatedPlan
            : state.selectedPlan
      }));
      return activatedPlan;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Plan aktif hâle getirilemedi.";
      set({ isLoading: false, error: message });
      throw error;
    }
  },
  addMeal: async (planId, payload) => {
    set({ isLoading: true, error: null });
    try {
      const updatedPlan = await dietPlanService.addMeal(planId, payload);
      set((state) => ({
        isLoading: false,
        activePlan:
          state.activePlan?.id === updatedPlan.id ? updatedPlan : state.activePlan,
        selectedPlan:
          state.selectedPlan?.id === updatedPlan.id ? updatedPlan : state.selectedPlan
      }));
      if (updatedPlan.status === "active") {
        await rescheduleRemindersForPlan(updatedPlan);
      }
      return updatedPlan;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Öğün eklenemedi.";
      set({ isLoading: false, error: message });
      throw error;
    }
  },
  updateMeal: async (planId, mealId, payload) => {
    set({ isLoading: true, error: null });
    try {
      const updatedPlan = await dietPlanService.updateMeal(planId, mealId, payload);
      set((state) => ({
        isLoading: false,
        activePlan:
          state.activePlan?.id === updatedPlan.id ? updatedPlan : state.activePlan,
        selectedPlan:
          state.selectedPlan?.id === updatedPlan.id ? updatedPlan : state.selectedPlan
      }));
      if (updatedPlan.status === "active") {
        await rescheduleRemindersForPlan(updatedPlan);
      }
      return updatedPlan;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Öğün güncellenemedi.";
      set({ isLoading: false, error: message });
      throw error;
    }
  },
  deleteMeal: async (planId, mealId) => {
    set({ isLoading: true, error: null });
    try {
      const updatedPlan = await dietPlanService.deleteMeal(planId, mealId);
      set((state) => ({
        isLoading: false,
        activePlan:
          state.activePlan?.id === updatedPlan.id ? updatedPlan : state.activePlan,
        selectedPlan:
          state.selectedPlan?.id === updatedPlan.id ? updatedPlan : state.selectedPlan
      }));
      if (updatedPlan.status === "active") {
        await rescheduleRemindersForPlan(updatedPlan);
      }
      return updatedPlan;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Öğün silinemedi.";
      set({ isLoading: false, error: message });
      throw error;
    }
  },
  clearError: () => {
    set({ error: null });
  },
  reset: () => {
    set({
      activePlan: null,
      history: [],
      selectedPlan: null,
      isLoading: false,
      error: null
    });
  }
}));
