export interface ProfileResponseDto {
  id: string;
  phoneNumber: string;
  name: string;
  heightCm?: number;
  gender?: "male" | "female" | "other";
  timezone: string;
  startingWeightKg?: number;
  targetWeightKg?: number;
  dailyWaterTargetMl?: number;
  isActive: boolean;
  isVerified: boolean;
  isProfileCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}
