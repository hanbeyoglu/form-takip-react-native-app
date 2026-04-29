import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type WaterLogDocument = HydratedDocument<WaterLog>;

export enum WaterLogSource {
  Manual = "manual",
  QuickAdd = "quickAdd"
}

@Schema({ timestamps: true })
export class WaterLog {
  @Prop({ required: true, type: Types.ObjectId, ref: "User", index: true })
  userId!: Types.ObjectId;

  @Prop({ required: true, min: 50, max: 5000 })
  amountMl!: number;

  @Prop({ required: true, index: true })
  loggedAt!: Date;

  @Prop({ required: true, enum: Object.values(WaterLogSource) })
  source!: WaterLogSource;

  createdAt!: Date;
  updatedAt!: Date;
}

export const WaterLogSchema = SchemaFactory.createForClass(WaterLog);
