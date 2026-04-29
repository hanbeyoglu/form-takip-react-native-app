import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true, trim: true })
  phoneNumber!: string;

  @Prop({ required: false })
  passwordHash!: string;

  @Prop({ required: false, trim: true })
  name!: string;

  @Prop({ required: false })
  heightCm?: number;

  @Prop({ required: false, enum: ["male", "female", "other"] })
  gender?: "male" | "female" | "other";

  @Prop({ required: true, default: "UTC" })
  timezone!: string;

  @Prop({ required: false })
  startingWeightKg?: number;

  @Prop({ required: false })
  targetWeightKg?: number;

  @Prop({ required: false })
  dailyWaterTargetMl?: number;

  @Prop({ required: true, default: false })
  isActive!: boolean;

  @Prop({ required: true, default: false })
  isVerified!: boolean;

  @Prop({ required: false })
  registrationOtpHash?: string;

  @Prop({ required: false })
  registrationOtpExpiresAt?: Date;

  @Prop({ required: false })
  registrationVerifiedAt?: Date;

  @Prop({ required: false })
  passwordResetOtpHash?: string;

  @Prop({ required: false })
  passwordResetOtpExpiresAt?: Date;

  @Prop({ required: false })
  passwordResetVerifiedAt?: Date;

  createdAt!: Date;
  updatedAt!: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
