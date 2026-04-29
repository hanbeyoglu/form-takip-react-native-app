import { storageService } from '../storage/storage.service';
import { DietPlan } from '../../types/diet-plan.types';
import { getMealApplicableDates } from '../../shared/utils/mealApplicability';
import {
  NotificationPermissionStatus,
  NotificationPreferences,
} from '../../types/notification.types';
import {
  localNotificationProvider,
  ScheduledNotificationInput,
} from './localNotification.provider';
import {
  MEAL_NOTIFICATION_PREFIX,
  SCHEDULED_MEAL_IDS_KEY,
  SCHEDULED_WATER_IDS_KEY,
  WATER_NOTIFICATION_PREFIX,
} from './notification.constants';

export interface NotificationService {
  initialize(): Promise<NotificationPermissionStatus>;
  getPermissionStatus(): Promise<NotificationPermissionStatus>;
  requestPermission(): Promise<NotificationPermissionStatus>;
  scheduleMealReminders(
    activePlan: DietPlan | null,
    preferences: NotificationPreferences
  ): Promise<void>;
  scheduleWaterReminders(preferences: NotificationPreferences): Promise<void>;
  cancelMealReminders(): Promise<void>;
  cancelWaterReminders(): Promise<void>;
  rescheduleAllReminders(
    activePlan: DietPlan | null,
    preferences: NotificationPreferences
  ): Promise<void>;
}

class NotificationServiceAdapter implements NotificationService {
  async initialize(): Promise<NotificationPermissionStatus> {
    return this.getPermissionStatus();
  }

  async getPermissionStatus(): Promise<NotificationPermissionStatus> {
    return localNotificationProvider.getPermissionStatus();
  }

  async requestPermission(): Promise<NotificationPermissionStatus> {
    return localNotificationProvider.requestPermission();
  }

  async scheduleMealReminders(
    activePlan: DietPlan | null,
    preferences: NotificationPreferences
  ): Promise<void> {
    await this.cancelMealReminders();
    if (!activePlan || !preferences.mealReminderEnabled) {
      return;
    }

    const scheduleQueue: ScheduledNotificationInput[] = [];
    for (const meal of activePlan.meals) {
      const days = getMealApplicableDates(
        meal,
        activePlan.weekStartDate,
        activePlan.weekEndDate
      );

      for (const dateString of days) {
        const mealDate = this.combineDateAndTime(dateString, meal.time);
        const dateKey = dateString.replace(/-/g, '');
        if (preferences.mealAtTimeEnabled) {
          const title = this.buildMealTitle(meal.name);
          const body = this.buildMealBody(meal.name, meal.note, 'atTime');
          scheduleQueue.push({
            id: `${MEAL_NOTIFICATION_PREFIX}:at:${activePlan.id}:${meal.mealId}:${dateKey}`,
            title,
            body,
            timestamp: mealDate.getTime(),
          });
        }
        if (preferences.mealReminderOffsetMin > 0) {
          const beforeDate = new Date(
            mealDate.getTime() - preferences.mealReminderOffsetMin * 60_000
          );
          const title = this.buildMealTitle(meal.name);
          const body = this.buildMealBody(
            meal.name,
            meal.note,
            'before',
            preferences.mealReminderOffsetMin
          );
          scheduleQueue.push({
            id: `${MEAL_NOTIFICATION_PREFIX}:before:${activePlan.id}:${meal.mealId}:${dateKey}`,
            title,
            body,
            timestamp: beforeDate.getTime(),
          });
        }
      }
    }

    const now = Date.now();
    const futureQueue = scheduleQueue.filter((item) => item.timestamp > now);
    await Promise.all(futureQueue.map((item) => localNotificationProvider.schedule(item)));
    await storageService.setItem(
      SCHEDULED_MEAL_IDS_KEY,
      JSON.stringify(futureQueue.map((item) => item.id))
    );
  }

  async scheduleWaterReminders(preferences: NotificationPreferences): Promise<void> {
    await this.cancelWaterReminders();
    if (!preferences.waterReminderEnabled) {
      return;
    }

    const startMinutes = this.timeToMinutes(preferences.waterReminderStartTime);
    const endMinutes = this.timeToMinutes(preferences.waterReminderEndTime);
    const scheduledIds: string[] = [];
    const notifications: ScheduledNotificationInput[] = [];

    for (let dayOffset = 0; dayOffset < 7; dayOffset += 1) {
      const baseDate = new Date();
      baseDate.setDate(baseDate.getDate() + dayOffset);
      baseDate.setHours(0, 0, 0, 0);

      for (
        let minuteCursor = startMinutes;
        minuteCursor <= endMinutes;
        minuteCursor += preferences.waterIntervalMin
      ) {
        const reminder = new Date(baseDate);
        reminder.setMinutes(minuteCursor);
        const dateKey = this.formatLocalDate(baseDate).replace(/-/g, '');
        const id = `${WATER_NOTIFICATION_PREFIX}:${dateKey}:${minuteCursor}`;
        notifications.push({
          id,
          title: 'Su hatırlatması',
          body: 'Hedefine yaklaşmak için bir bardak su iç.',
          timestamp: reminder.getTime(),
        });
      }
    }

    const now = Date.now();
    for (const notification of notifications) {
      if (notification.timestamp > now) {
        await localNotificationProvider.schedule(notification);
        scheduledIds.push(notification.id);
      }
    }

    await storageService.setItem(SCHEDULED_WATER_IDS_KEY, JSON.stringify(scheduledIds));
  }

  async cancelMealReminders(): Promise<void> {
    const raw = await storageService.getItem(SCHEDULED_MEAL_IDS_KEY);
    const ids = raw ? (JSON.parse(raw) as string[]) : [];
    if (ids.length > 0) {
      await localNotificationProvider.cancelByIds(ids);
    }
    await storageService.setItem(SCHEDULED_MEAL_IDS_KEY, JSON.stringify([]));
  }

  async cancelWaterReminders(): Promise<void> {
    const raw = await storageService.getItem(SCHEDULED_WATER_IDS_KEY);
    const ids = raw ? (JSON.parse(raw) as string[]) : [];
    if (ids.length > 0) {
      await localNotificationProvider.cancelByIds(ids);
    }
    await storageService.setItem(SCHEDULED_WATER_IDS_KEY, JSON.stringify([]));
  }

  async rescheduleAllReminders(
    activePlan: DietPlan | null,
    preferences: NotificationPreferences
  ): Promise<void> {
    await this.cancelMealReminders();
    await this.cancelWaterReminders();
    await this.scheduleMealReminders(activePlan, preferences);
    await this.scheduleWaterReminders(preferences);
  }

  private combineDateAndTime(dateString: string, time: string): Date {
    const [hourStr, minuteStr] = time.split(':');
    const date = new Date(`${dateString}T00:00:00`);
    date.setHours(Number(hourStr), Number(minuteStr), 0, 0);
    return date;
  }

  private timeToMinutes(time: string): number {
    const [hourStr, minuteStr] = time.split(':');
    return Number(hourStr) * 60 + Number(minuteStr);
  }

  private formatLocalDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private buildMealTitle(mealName: string): string {
    const normalized = mealName.trim().toLocaleLowerCase('tr-TR');
    if (normalized.includes('kahvalti')) {
      return 'Kahvaltı zamanı';
    }
    if (normalized.includes('ogle')) {
      return 'Öğle yemeği zamanı';
    }
    if (normalized.includes('ara')) {
      return 'Ara öğün zamanı';
    }
    if (normalized.includes('aksam')) {
      return 'Akşam yemeği zamanı';
    }
    if (normalized.includes('gece')) {
      return 'Gece öğünü zamanı';
    }
    return `${mealName} zamanı`;
  }

  private buildMealBody(
    mealName: string,
    mealNote: string | undefined,
    reminderType: 'before' | 'atTime',
    beforeMinutes?: number
  ): string {
    const note = this.truncateText(mealNote?.trim() ?? '', 90);
    if (note.length > 0) {
      if (reminderType === 'before') {
        return `${beforeMinutes ?? 0} dk sonra: ${note}`;
      }
      return note;
    }
    if (reminderType === 'before') {
      return `${beforeMinutes ?? 0} dakika sonra ${mealName} için hazırlan.`;
    }
    return `${mealName} zamanı geldi.`;
  }

  private truncateText(input: string, maxLength: number): string {
    if (input.length <= maxLength) {
      return input;
    }
    return `${input.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
  }
}

export const notificationService: NotificationService = new NotificationServiceAdapter();
