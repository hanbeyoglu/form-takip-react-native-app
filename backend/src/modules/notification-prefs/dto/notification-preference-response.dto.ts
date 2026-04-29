export interface NotificationPreferenceResponseDto {
  userId: string;
  mealReminderEnabled: boolean;
  mealReminderOffsetMin: 15 | 30 | 60;
  mealAtTimeEnabled: boolean;
  waterReminderEnabled: boolean;
  waterIntervalMin: number;
  waterReminderStartTime: string;
  waterReminderEndTime: string;
  updatedAt: string;
}
