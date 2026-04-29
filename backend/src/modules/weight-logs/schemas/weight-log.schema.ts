import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type WeightLogDocument = HydratedDocument<WeightLog>;

@Schema({ timestamps: true })
export class WeightLog {
  @Prop({ required: true, type: Types.ObjectId, ref: "User", index: true })
  userId!: Types.ObjectId;

  @Prop({ required: true, min: 30, max: 350 })
  weightKg!: number;

  @Prop({ required: true, index: true })
  loggedAt!: Date;

  @Prop({ required: false, trim: true })
  note?: string;

  createdAt!: Date;
  updatedAt!: Date;
}

export const WeightLogSchema = SchemaFactory.createForClass(WeightLog);
