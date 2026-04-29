import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type DietPlanDocument = HydratedDocument<DietPlan>;

export enum DietPlanStatus {
  Active = "active",
  Archived = "archived"
}

@Schema({ _id: false })
export class MealEntry {
  @Prop({ required: true })
  mealId!: string;

  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: true })
  time!: string;

  @Prop({ required: false, trim: true })
  note?: string;

  @Prop({ required: true, min: 1 })
  order!: number;

  @Prop({
    required: true,
    enum: ["every_day", "selected_dates"],
    default: "every_day"
  })
  appliesToType!: "every_day" | "selected_dates";

  @Prop({ required: true, type: [String], default: [] })
  appliesToDates!: string[];
}

export const MealEntrySchema = SchemaFactory.createForClass(MealEntry);

@Schema({ timestamps: true })
export class DietPlan {
  @Prop({ required: true, type: Types.ObjectId, ref: "User", index: true })
  userId!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({ required: true })
  weekStartDate!: Date;

  @Prop({ required: true })
  weekEndDate!: Date;

  @Prop({ required: true, enum: Object.values(DietPlanStatus) })
  status!: DietPlanStatus;

  @Prop({ required: true, min: 1, default: 1 })
  version!: number;

  @Prop({ required: false, trim: true })
  notes?: string;

  @Prop({ required: true, type: [MealEntrySchema], default: [] })
  meals!: MealEntry[];

  createdAt!: Date;
  updatedAt!: Date;
}

export const DietPlanSchema = SchemaFactory.createForClass(DietPlan);
DietPlanSchema.index(
  { userId: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: { status: DietPlanStatus.Active }
  }
);
