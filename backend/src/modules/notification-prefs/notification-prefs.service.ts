import { BadRequestException, Injectable } from "@nestjs/common";

import { NotificationPreferenceResponseDto } from "./dto/notification-preference-response.dto";
import { UpdateNotificationPreferenceDto } from "./dto/update-notification-preference.dto";
import { NotificationPrefsRepository } from "./repositories/notification-prefs.repository";
import { NotificationPreferenceDocument } from "./schemas/notification-preference.schema";

@Injectable()
export class NotificationPrefsService {
  constructor(private readonly repository: NotificationPrefsRepository) {}

  async getPreferences(
    userId: string
  ): Promise<NotificationPreferenceResponseDto> {
    const prefs = await this.getOrCreate(userId);
    return this.toResponse(prefs);
  }

  async updatePreferences(
    userId: string,
    payload: UpdateNotificationPreferenceDto
  ): Promise<NotificationPreferenceResponseDto> {
    const prefs = await this.getOrCreate(userId);

    if (payload.mealReminderEnabled !== undefined) {
      prefs.mealReminderEnabled = payload.mealReminderEnabled;
    }
    if (payload.mealReminderOffsetMin !== undefined) {
      prefs.mealReminderOffsetMin = payload.mealReminderOffsetMin;
    }
    if (payload.mealAtTimeEnabled !== undefined) {
      prefs.mealAtTimeEnabled = payload.mealAtTimeEnabled;
    }
    if (payload.waterReminderEnabled !== undefined) {
      prefs.waterReminderEnabled = payload.waterReminderEnabled;
    }
    if (payload.waterIntervalMin !== undefined) {
      prefs.waterIntervalMin = payload.waterIntervalMin;
    }
    if (payload.waterReminderStartTime !== undefined) {
      prefs.waterReminderStartTime = payload.waterReminderStartTime;
    }
    if (payload.waterReminderEndTime !== undefined) {
      prefs.waterReminderEndTime = payload.waterReminderEndTime;
    }

    this.assertWaterRange(
      prefs.waterReminderStartTime,
      prefs.waterReminderEndTime
    );

    const updated = await this.repository.save(prefs);
    return this.toResponse(updated);
  }

  private async getOrCreate(userId: string): Promise<NotificationPreferenceDocument> {
    const existing = await this.repository.findByUserId(userId);
    if (existing) {
      return existing;
    }
    return this.repository.createDefault(userId);
  }

  private assertWaterRange(start: string, end: string): void {
    const startMinutes = this.timeToMinutes(start);
    const endMinutes = this.timeToMinutes(end);
    if (endMinutes <= startMinutes) {
      throw new BadRequestException(
        "waterReminderEndTime must be later than waterReminderStartTime"
      );
    }
  }

  private timeToMinutes(time: string): number {
    const [hourStr, minuteStr] = time.split(":");
    return Number(hourStr) * 60 + Number(minuteStr);
  }

  private toResponse(
    prefs: NotificationPreferenceDocument
  ): NotificationPreferenceResponseDto {
    return {
      userId: prefs.userId.toString(),
      mealReminderEnabled: prefs.mealReminderEnabled,
      mealReminderOffsetMin: prefs.mealReminderOffsetMin as 15 | 30 | 60,
      mealAtTimeEnabled: prefs.mealAtTimeEnabled,
      waterReminderEnabled: prefs.waterReminderEnabled,
      waterIntervalMin: prefs.waterIntervalMin,
      waterReminderStartTime: prefs.waterReminderStartTime,
      waterReminderEndTime: prefs.waterReminderEndTime,
      updatedAt: prefs.updatedAt.toISOString()
    };
  }
}
