import { FirebaseAuthTypes } from "@react-native-firebase/auth";
import { apiClient } from "../../../services/api/client";
import {
  AuthSession,
  RequestPasswordResetOtpResponse,
  RequestRegisterOtpResponse,
  VerifyResetOtpResponse,
  VerifyRegisterOtpResponse
} from "../../../types/auth.types";
import { normalizePhoneNumber } from "../utils/phone";
import {
  confirmFirebasePhoneVerification,
  requestFirebasePhoneVerification
} from "./firebasePhoneAuth.service";

export type RequestRegisterOtpInput = {
  phoneNumber: string;
};

export type VerifyRegisterOtpInput = {
  phoneNumber: string;
  code: string;
};

export type RequestPasswordResetOtpInput = {
  phoneNumber: string;
};

export type VerifyResetOtpInput = {
  phoneNumber: string;
  code: string;
};

export type ResetPasswordInput = {
  phoneNumber: string;
  password: string;
  firebaseIdToken: string;
};

export type CompleteRegistrationInput = {
  phoneNumber: string;
  password: string;
  name: string;
  gender: "male" | "female" | "other";
  timezone: string;
  firebaseIdToken: string;
};

export type LoginInput = {
  phoneNumber: string;
  password: string;
};

class AuthService {
  async requestRegisterOtp(
    input: RequestRegisterOtpInput
  ): Promise<RequestRegisterOtpResponse> {
    const phoneNumber = normalizePhoneNumber(input.phoneNumber);
    const confirmationResult = await requestFirebasePhoneVerification(phoneNumber);

    return {
      phoneNumber,
      otpExpiresAt: new Date(Date.now() + 60 * 1000).toISOString(),
      confirmationResult
    };
  }

  async verifyRegisterOtp(
    input: VerifyRegisterOtpInput & {
      confirmationResult: FirebaseAuthTypes.ConfirmationResult;
    }
  ): Promise<VerifyRegisterOtpResponse> {
    const phoneNumber = normalizePhoneNumber(input.phoneNumber);
    const response = await confirmFirebasePhoneVerification({
      confirmationResult: input.confirmationResult,
      code: input.code.trim()
    });

    return {
      phoneNumber: normalizePhoneNumber(response.phoneNumber ?? phoneNumber),
      firebaseIdToken: response.firebaseIdToken
    };
  }

  async completeRegistration(
    input: CompleteRegistrationInput
  ): Promise<AuthSession> {
    const payload: CompleteRegistrationInput = {
      ...input,
      phoneNumber: normalizePhoneNumber(input.phoneNumber)
    };

    return apiClient.postData<AuthSession, CompleteRegistrationInput>(
      "/auth/complete-registration",
      payload
    );
  }

  async requestPasswordResetOtp(
    input: RequestPasswordResetOtpInput
  ): Promise<RequestPasswordResetOtpResponse> {
    const phoneNumber = normalizePhoneNumber(input.phoneNumber);
    const confirmationResult = await requestFirebasePhoneVerification(phoneNumber);
    return {
      phoneNumber,
      otpExpiresAt: new Date(Date.now() + 60 * 1000).toISOString(),
      confirmationResult
    };
  }

  async verifyResetOtp(
    input: VerifyResetOtpInput & {
      confirmationResult: FirebaseAuthTypes.ConfirmationResult;
    }
  ): Promise<VerifyResetOtpResponse> {
    const phoneNumber = normalizePhoneNumber(input.phoneNumber);
    const response = await confirmFirebasePhoneVerification({
      confirmationResult: input.confirmationResult,
      code: input.code.trim()
    });

    return {
      phoneNumber: normalizePhoneNumber(response.phoneNumber ?? phoneNumber),
      firebaseIdToken: response.firebaseIdToken
    };
  }

  async resetPassword(input: ResetPasswordInput): Promise<void> {
    const payload: ResetPasswordInput = {
      ...input,
      phoneNumber: normalizePhoneNumber(input.phoneNumber)
    };

    await apiClient.postData<void, ResetPasswordInput>("/auth/reset-password", payload);
  }

  async login(input: LoginInput): Promise<AuthSession> {
    const payload: LoginInput = {
      ...input,
      phoneNumber: normalizePhoneNumber(input.phoneNumber)
    };
    return apiClient.postData<AuthSession, LoginInput>(
      "/auth/login",
      payload
    );
  }
}

export const authService = new AuthService();
