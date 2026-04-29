import notifee, {
  AndroidImportance,
  AuthorizationStatus,
  TimestampTrigger,
  TriggerType
} from "@notifee/react-native";

import { NotificationPermissionStatus } from "../../types/notification.types";

export type ScheduledNotificationInput = {
  id: string;
  title: string;
  body: string;
  timestamp: number;
};

export interface LocalNotificationProvider {
  getPermissionStatus(): Promise<NotificationPermissionStatus>;
  requestPermission(): Promise<NotificationPermissionStatus>;
  schedule(notification: ScheduledNotificationInput): Promise<void>;
  cancelByIds(ids: string[]): Promise<void>;
}

class NotifeeLocalNotificationProvider implements LocalNotificationProvider {
  private channelId: string | null = null;

  async getPermissionStatus(): Promise<NotificationPermissionStatus> {
    const settings = await notifee.getNotificationSettings();
    if (settings.authorizationStatus === AuthorizationStatus.AUTHORIZED) {
      return "granted";
    }
    if (settings.authorizationStatus === AuthorizationStatus.DENIED) {
      return "denied";
    }
    return "unknown";
  }

  async requestPermission(): Promise<NotificationPermissionStatus> {
    const settings = await notifee.requestPermission();
    if (settings.authorizationStatus >= AuthorizationStatus.AUTHORIZED) {
      return "granted";
    }
    return "denied";
  }

  async schedule(notification: ScheduledNotificationInput): Promise<void> {
    const channelId = await this.ensureChannel();
    const trigger: TimestampTrigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: notification.timestamp
    };

    await notifee.createTriggerNotification(
      {
        id: notification.id,
        title: notification.title,
        body: notification.body,
        android: {
          channelId
        }
      },
      trigger
    );
  }

  async cancelByIds(ids: string[]): Promise<void> {
    await Promise.all(ids.map((id) => notifee.cancelNotification(id)));
  }

  private async ensureChannel(): Promise<string> {
    if (this.channelId) {
      return this.channelId;
    }
    this.channelId = await notifee.createChannel({
      id: "diet-app-reminders",
      name: "Diet App Reminders",
      importance: AndroidImportance.HIGH
    });
    return this.channelId;
  }
}

export const localNotificationProvider: LocalNotificationProvider =
  new NotifeeLocalNotificationProvider();
