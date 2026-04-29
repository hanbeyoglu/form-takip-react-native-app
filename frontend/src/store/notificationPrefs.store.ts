import { create } from "zustand";

import {
  notificationPreferencesService,
  UpdateNotificationPreferencesInput
} from "../features/notifications/services/notificationPreferences.service";
import { notificationService } from "../services/notification/notification.service";
import { useDietPlanStore } from "./dietPlan.store";
import {
  NotificationPermissionStatus,
  NotificationPreferences
} from "../types/notification.types";

type NotificationPrefsState = {
  preferences: NotificationPreferences | null;
  permissionStatus: NotificationPermissionStatus;
  isLoading: boolean;
  error: string | null;
  fetchPreferences: () => Promise<void>;
  requestPermission: () => Promise<NotificationPermissionStatus>;
  updatePreferences: (
    payload: UpdateNotificationPreferencesInput
  ) => Promise<NotificationPreferences>;
  rescheduleAll: () => Promise<void>;
  clearError: () => void;
  reset: () => void;
};

export const useNotificationPrefsStore = create<NotificationPrefsState>(
  (set, get) => ({
    preferences: null,
    permissionStatus: "unknown",
    isLoading: false,
    error: null,
    fetchPreferences: async () => {
      set({ isLoading: true, error: null });
      try {
        const [preferences, permissionStatus] = await Promise.all([
          notificationPreferencesService.getPreferences(),
          notificationService.initialize()
        ]);
        set({ preferences, permissionStatus, isLoading: false });
      } catch (error) {
        set({
          isLoading: false,
          error: error instanceof Error ? error.message : "Bildirim tercihleri alınamadı."
        });
      }
    },
    requestPermission: async () => {
      const status = await notificationService.requestPermission();
      set({ permissionStatus: status });
      return status;
    },
    updatePreferences: async (payload) => {
      set({ isLoading: true, error: null });
      try {
        const preferences = await notificationPreferencesService.updatePreferences(
          payload
        );
        set({ preferences, isLoading: false });
        await get().rescheduleAll();
        return preferences;
      } catch (error) {
        set({
          isLoading: false,
          error: error instanceof Error ? error.message : "Bildirim tercihleri güncellenemedi."
        });
        throw error;
      }
    },
    rescheduleAll: async () => {
      const preferences = get().preferences;
      if (!preferences) {
        return;
      }
      const activePlan = useDietPlanStore.getState().activePlan;
      await notificationService.rescheduleAllReminders(activePlan, preferences);
    },
    clearError: () => set({ error: null }),
    reset: () =>
      set({
        preferences: null,
        permissionStatus: "unknown",
        isLoading: false,
        error: null
      })
  })
);
