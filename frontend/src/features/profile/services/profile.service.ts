import { apiClient } from "../../../services/api/client";
import { AuthUser } from "../../../types/auth.types";

export type UpdateProfileInput = {
  name?: string;
  heightCm?: number;
  gender?: "male" | "female" | "other";
  timezone?: string;
  startingWeightKg?: number;
  targetWeightKg?: number;
  dailyWaterTargetMl?: number;
};

class ProfileService {
  async getProfile(): Promise<AuthUser> {
    return apiClient.getData<AuthUser>("/profile");
  }

  async updateProfile(input: UpdateProfileInput): Promise<AuthUser> {
    return apiClient.patchData<AuthUser, UpdateProfileInput>(
      "/profile",
      input
    );
  }
}

export const profileService = new ProfileService();
