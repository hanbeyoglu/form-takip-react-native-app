import { create } from "zustand";

import { apiClient } from "../services/api/client";
import {
  authService,
  CompleteRegistrationInput,
  LoginInput,
  RequestPasswordResetOtpInput,
  RequestRegisterOtpInput,
  ResetPasswordInput,
  VerifyResetOtpInput,
  VerifyRegisterOtpInput
} from "../features/auth/services/auth.service";
import { mapAuthError } from "../features/auth/utils/authError";
import { profileService } from "../features/profile/services/profile.service";
import { notificationService } from "../services/notification/notification.service";
import { storageService } from "../services/storage/storage.service";
import { useDietPlanStore } from "./dietPlan.store";
import { useNotificationPrefsStore } from "./notificationPrefs.store";
import { useStatsStore } from "./stats.store";
import { useWaterStore } from "./water.store";
import { useWeightStore } from "./weight.store";
import {
  AuthUser,
  PendingPasswordReset,
  PendingRegistration
} from "../types/auth.types";

const AUTH_TOKEN_STORAGE_KEY = "auth.accessToken";
let authOperationVersion = 0;

type AuthState = {
  isHydrated: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  authError: string | null;
  authFeedback: string | null;
  accessToken: string | null;
  user: AuthUser | null;
  pendingRegistration: PendingRegistration | null;
  pendingPasswordReset: PendingPasswordReset | null;
  initializeSession: () => Promise<void>;
  login: (input: LoginInput) => Promise<void>;
  requestRegisterOtp: (input: RequestRegisterOtpInput) => Promise<PendingRegistration>;
  verifyRegisterOtp: (input: VerifyRegisterOtpInput) => Promise<PendingRegistration>;
  completeRegistration: (
    input: Omit<CompleteRegistrationInput, "firebaseIdToken">
  ) => Promise<void>;
  clearPendingRegistration: () => void;
  requestPasswordResetOtp: (
    input: RequestPasswordResetOtpInput
  ) => Promise<PendingPasswordReset>;
  verifyResetOtp: (input: VerifyResetOtpInput) => Promise<PendingPasswordReset>;
  resetPassword: (input: Omit<ResetPasswordInput, "firebaseIdToken">) => Promise<void>;
  clearPendingPasswordReset: () => void;
  refreshProfile: () => Promise<void>;
  updateUserInState: (user: AuthUser) => void;
  clearAuthError: () => void;
  clearAuthFeedback: () => void;
  logout: () => Promise<void>;
};

function resetSessionScopedStores(): void {
  useDietPlanStore.getState().reset();
  useWaterStore.getState().reset();
  useWeightStore.getState().reset();
  useStatsStore.getState().reset();
  useNotificationPrefsStore.getState().reset();
}

export const useAuthStore = create<AuthState>((set) => ({
  isHydrated: false,
  isAuthenticated: false,
  isLoading: false,
  authError: null,
  authFeedback: null,
  accessToken: null,
  user: null,
  pendingRegistration: null,
  pendingPasswordReset: null,
  initializeSession: async () => {
    const currentVersion = ++authOperationVersion;
    set({ isLoading: true, authError: null, authFeedback: null });
    try {
      const token = await storageService.getItem(AUTH_TOKEN_STORAGE_KEY);
      if (currentVersion !== authOperationVersion) {
        return;
      }
      if (!token) {
        set({
          isHydrated: true,
          isLoading: false,
          isAuthenticated: false,
          accessToken: null,
          user: null,
          pendingRegistration: null,
          pendingPasswordReset: null
        });
        return;
      }
      apiClient.setAccessToken(token);
      const profile = await profileService.getProfile();
      if (currentVersion !== authOperationVersion) {
        return;
      }
      set({
        isHydrated: true,
        isLoading: false,
        isAuthenticated: true,
        accessToken: token,
        user: profile,
        pendingRegistration: null,
        pendingPasswordReset: null
      });
    } catch {
      if (currentVersion !== authOperationVersion) {
        return;
      }
      apiClient.setAccessToken(null);
      await storageService.removeItem(AUTH_TOKEN_STORAGE_KEY);
      set({
        isHydrated: true,
        isLoading: false,
        isAuthenticated: false,
        accessToken: null,
        user: null,
        pendingRegistration: null,
        pendingPasswordReset: null
      });
    }
  },
  login: async (input) => {
    const currentVersion = ++authOperationVersion;
    set({ isLoading: true, authError: null, authFeedback: null });
    try {
      const session = await authService.login(input);
      if (currentVersion !== authOperationVersion) {
        return;
      }
      apiClient.setAccessToken(session.accessToken);
      await storageService.setItem(AUTH_TOKEN_STORAGE_KEY, session.accessToken);
      set({
        isHydrated: true,
        isAuthenticated: true,
        isLoading: false,
        accessToken: session.accessToken,
        user: session.profile,
        pendingRegistration: null,
        pendingPasswordReset: null
      });
    } catch (error) {
      set({
        isLoading: false,
        authError: mapAuthError(error, "auth.errors.loginFailed")
      });
      throw error;
    }
  },
  requestRegisterOtp: async (input) => {
    const currentVersion = ++authOperationVersion;
    set({ isLoading: true, authError: null, authFeedback: null });
    try {
      const response = await authService.requestRegisterOtp(input);
      if (currentVersion !== authOperationVersion) {
        return {
          phoneNumber: input.phoneNumber,
          otpExpiresAt: undefined,
          firebaseIdToken: null,
          confirmationResult: null
        };
      }
      const pendingRegistration = {
        phoneNumber: response.phoneNumber,
        otpExpiresAt: response.otpExpiresAt,
        firebaseIdToken: null,
        confirmationResult: response.confirmationResult
      };
      set({
        isLoading: false,
        pendingRegistration,
        pendingPasswordReset: null
      });
      return pendingRegistration;
    } catch (error) {
      set({
        isLoading: false,
        authError: mapAuthError(error, "auth.errors.requestOtpFailed")
      });
      throw error;
    }
  },
  verifyRegisterOtp: async (input) => {
    const currentVersion = ++authOperationVersion;
    const currentPendingRegistration = useAuthStore.getState().pendingRegistration;
    if (!currentPendingRegistration?.confirmationResult) {
      const error = new Error("Registration session missing");
      set({
        isLoading: false,
        authError: mapAuthError(error, "auth.errors.verifyOtpFailed")
      });
      throw error;
    }
    set({ isLoading: true, authError: null, authFeedback: null });
    try {
      const response = await authService.verifyRegisterOtp({
        ...input,
        confirmationResult: currentPendingRegistration.confirmationResult
      });
      if (currentVersion !== authOperationVersion) {
        return {
          phoneNumber: input.phoneNumber,
          otpExpiresAt: undefined,
          firebaseIdToken: null,
          confirmationResult: null
        };
      }
      const pendingRegistration = {
        phoneNumber: response.phoneNumber,
        otpExpiresAt: currentPendingRegistration?.otpExpiresAt,
        firebaseIdToken: response.firebaseIdToken,
        confirmationResult: null
      };
      set({
        isLoading: false,
        pendingRegistration,
        pendingPasswordReset: null
      });
      return pendingRegistration;
    } catch (error) {
      set({
        isLoading: false,
        authError: mapAuthError(error, "auth.errors.verifyOtpFailed")
      });
      throw error;
    }
  },
  completeRegistration: async (input) => {
    const currentVersion = ++authOperationVersion;
    const pendingRegistration = useAuthStore.getState().pendingRegistration;
    if (!pendingRegistration?.firebaseIdToken) {
      const error = new Error("Registration session missing");
      set({
        isLoading: false,
        authError: mapAuthError(error, "auth.errors.completeRegistrationFailed")
      });
      throw error;
    }

    set({ isLoading: true, authError: null });
    try {
      const session = await authService.completeRegistration({
        ...input,
        firebaseIdToken: pendingRegistration.firebaseIdToken
      });
      if (currentVersion !== authOperationVersion) {
        return;
      }
      apiClient.setAccessToken(session.accessToken);
      await storageService.setItem(AUTH_TOKEN_STORAGE_KEY, session.accessToken);
      set({
        isHydrated: true,
        isAuthenticated: true,
        isLoading: false,
        accessToken: session.accessToken,
        user: session.profile,
        pendingRegistration: null,
        pendingPasswordReset: null
      });
    } catch (error) {
      set({
        isLoading: false,
        authError: mapAuthError(error, "auth.errors.completeRegistrationFailed")
      });
      throw error;
    }
  },
  clearPendingRegistration: () => {
    set({ pendingRegistration: null });
  },
  requestPasswordResetOtp: async (input) => {
    const currentVersion = ++authOperationVersion;
    set({ isLoading: true, authError: null, authFeedback: null });
    try {
      const response = await authService.requestPasswordResetOtp(input);
      if (currentVersion !== authOperationVersion) {
        return {
          phoneNumber: input.phoneNumber,
          otpExpiresAt: undefined,
          firebaseIdToken: null,
          confirmationResult: null
        };
      }
      const pendingPasswordReset = {
        phoneNumber: response.phoneNumber,
        otpExpiresAt: response.otpExpiresAt,
        firebaseIdToken: null,
        confirmationResult: response.confirmationResult
      };
      set({
        isLoading: false,
        pendingPasswordReset
      });
      return pendingPasswordReset;
    } catch (error) {
      set({
        isLoading: false,
        authError: mapAuthError(error, "auth.errors.requestResetOtpFailed")
      });
      throw error;
    }
  },
  verifyResetOtp: async (input) => {
    const currentVersion = ++authOperationVersion;
    const currentPendingPasswordReset = useAuthStore.getState().pendingPasswordReset;
    if (!currentPendingPasswordReset?.confirmationResult) {
      const error = new Error("Password reset session missing");
      set({
        isLoading: false,
        authError: mapAuthError(error, "auth.errors.verifyResetOtpFailed")
      });
      throw error;
    }
    set({ isLoading: true, authError: null, authFeedback: null });
    try {
      const response = await authService.verifyResetOtp({
        ...input,
        confirmationResult: currentPendingPasswordReset.confirmationResult
      });
      if (currentVersion !== authOperationVersion) {
        return {
          phoneNumber: input.phoneNumber,
          otpExpiresAt: undefined,
          firebaseIdToken: null,
          confirmationResult: null
        };
      }
      const pendingPasswordReset = {
        phoneNumber: response.phoneNumber,
        otpExpiresAt: currentPendingPasswordReset?.otpExpiresAt,
        firebaseIdToken: response.firebaseIdToken,
        confirmationResult: null
      };
      set({
        isLoading: false,
        pendingPasswordReset
      });
      return pendingPasswordReset;
    } catch (error) {
      set({
        isLoading: false,
        authError: mapAuthError(error, "auth.errors.verifyResetOtpFailed")
      });
      throw error;
    }
  },
  resetPassword: async (input) => {
    const currentVersion = ++authOperationVersion;
    const pendingPasswordReset = useAuthStore.getState().pendingPasswordReset;
    if (!pendingPasswordReset?.firebaseIdToken) {
      const error = new Error("Password reset session missing");
      set({
        isLoading: false,
        authError: mapAuthError(error, "auth.errors.resetPasswordFailed")
      });
      throw error;
    }

    set({ isLoading: true, authError: null, authFeedback: null });
    try {
      await authService.resetPassword({
        ...input,
        firebaseIdToken: pendingPasswordReset.firebaseIdToken
      });
      if (currentVersion !== authOperationVersion) {
        return;
      }
      set({
        isLoading: false,
        pendingPasswordReset: null
      });
    } catch (error) {
      set({
        isLoading: false,
        authError: mapAuthError(error, "auth.errors.resetPasswordFailed")
      });
      throw error;
    }
  },
  clearPendingPasswordReset: () => {
    set({ pendingPasswordReset: null });
  },
  refreshProfile: async () => {
    const currentVersion = authOperationVersion;
    try {
      const profile = await profileService.getProfile();
      if (currentVersion !== authOperationVersion) {
        return;
      }
      set({ user: profile });
    } catch (error) {
      if (
        error instanceof Error &&
        "code" in error &&
        (error as { code?: string }).code === "UNAUTHORIZED"
      ) {
        await storageService.removeItem(AUTH_TOKEN_STORAGE_KEY);
        apiClient.setAccessToken(null);
        set({
          isAuthenticated: false,
          accessToken: null,
          user: null,
          pendingRegistration: null,
          pendingPasswordReset: null
        });
        return;
      }
      throw error;
    }
  },
  updateUserInState: (user) => {
    set({ user });
  },
  clearAuthError: () => {
    set({ authError: null });
  },
  clearAuthFeedback: () => {
    set({ authFeedback: null });
  },
  logout: async () => {
    authOperationVersion += 1;
    await notificationService.cancelMealReminders();
    await notificationService.cancelWaterReminders();
    apiClient.setAccessToken(null);
    await storageService.removeItem(AUTH_TOKEN_STORAGE_KEY);
    resetSessionScopedStores();
    set({
      isHydrated: true,
      isLoading: false,
      authError: null,
      authFeedback: null,
      isAuthenticated: false,
      accessToken: null,
      user: null,
      pendingRegistration: null,
      pendingPasswordReset: null
    });
  }
}));

apiClient.setUnauthorizedHandler(() => {
  authOperationVersion += 1;
  void notificationService.cancelMealReminders();
  void notificationService.cancelWaterReminders();
  apiClient.setAccessToken(null);
  void storageService.removeItem(AUTH_TOKEN_STORAGE_KEY);
  resetSessionScopedStores();
  useAuthStore.setState({
    isAuthenticated: false,
    accessToken: null,
    user: null,
    isLoading: false,
    authError: null,
    authFeedback: null,
    isHydrated: true,
    pendingRegistration: null,
    pendingPasswordReset: null
  });
});
