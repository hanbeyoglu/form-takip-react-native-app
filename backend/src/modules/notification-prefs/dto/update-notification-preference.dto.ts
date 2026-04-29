import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  Matches,
  Max,
  Min
} from "class-validator";

export class UpdateNotificationPreferenceDto {
  @IsOptional()
  @IsBoolean()
  mealReminderEnabled?: boolean;

  @IsOptional()
  @IsIn([15, 30, 60])
  mealReminderOffsetMin?: number;

  @IsOptional()
  @IsBoolean()
  mealAtTimeEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  waterReminderEnabled?: boolean;

  @IsOptional()
  @IsInt()
  @Min(15)
  @Max(240)
  waterIntervalMin?: number;

  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: "waterReminderStartTime must be in HH:mm format"
  })
  waterReminderStartTime?: string;

  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: "waterReminderEndTime must be in HH:mm format"
  })
  waterReminderEndTime?: string;
}
