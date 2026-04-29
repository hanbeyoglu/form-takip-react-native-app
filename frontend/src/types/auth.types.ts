import { FirebaseAuthTypes } from "@react-native-firebase/auth";

export interface AuthUser {
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

export interface AuthSession {
  accessToken: string;
  profile: AuthUser;
}

export interface RequestRegisterOtpResponse {
  phoneNumber: string;
  otpExpiresAt: string;
  confirmationResult: FirebaseAuthTypes.ConfirmationResult;
}

export interface VerifyRegisterOtpResponse {
  phoneNumber: string;
  firebaseIdToken: string;
}

export interface RequestPasswordResetOtpResponse {
  phoneNumber: string;
  otpExpiresAt: string;
  confirmationResult: FirebaseAuthTypes.ConfirmationResult;
}

export interface VerifyResetOtpResponse {
  phoneNumber: string;
  firebaseIdToken: string;
}

export interface PendingRegistration {
  phoneNumber: string;
  otpExpiresAt?: string;
  firebaseIdToken: string | null;
  confirmationResult: FirebaseAuthTypes.ConfirmationResult | null;
}

export interface PendingPasswordReset {
  phoneNumber: string;
  otpExpiresAt?: string;
  firebaseIdToken: string | null;
  confirmationResult: FirebaseAuthTypes.ConfirmationResult | null;
}
