import { apiClient } from "../../../services/api/client";
import { NotificationPreferences } from "../../../types/notification.types";

export type UpdateNotificationPreferencesInput = Partial<
  Omit<NotificationPreferences, "userId" | "updatedAt">
>;

class NotificationPreferencesService {
  getPreferences(): Promise<NotificationPreferences> {
    return apiClient.getData<NotificationPreferences>("/notification-preferences");
  }

  updatePreferences(
    payload: UpdateNotificationPreferencesInput
  ): Promise<NotificationPreferences> {
    return apiClient.patchData<NotificationPreferences, UpdateNotificationPreferencesInput>(
      "/notification-preferences",
      payload
    );
  }
}

export const notificationPreferencesService = new NotificationPreferencesService();
