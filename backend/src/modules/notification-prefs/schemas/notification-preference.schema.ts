import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type NotificationPreferenceDocument =
  HydratedDocument<NotificationPreference>;

@Schema({ timestamps: true })
export class NotificationPreference {
  @Prop({ required: true, type: Types.ObjectId, ref: "User", unique: true })
  userId!: Types.ObjectId;

  @Prop({ required: true, default: true })
  mealReminderEnabled!: boolean;

  @Prop({ required: true, default: 30 })
  mealReminderOffsetMin!: number;

  @Prop({ required: true, default: true })
  mealAtTimeEnabled!: boolean;

  @Prop({ required: true, default: false })
  waterReminderEnabled!: boolean;

  @Prop({ required: true, default: 120 })
  waterIntervalMin!: number;

  @Prop({ required: true, default: "09:00" })
  waterReminderStartTime!: string;

  @Prop({ required: true, default: "21:00" })
  waterReminderEndTime!: string;

  createdAt!: Date;
  updatedAt!: Date;
}

export const NotificationPreferenceSchema = SchemaFactory.createForClass(
  NotificationPreference
);
