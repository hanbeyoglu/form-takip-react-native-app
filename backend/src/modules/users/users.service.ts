import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

import { ProfileResponseDto } from "./dto/profile-response.dto";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { User, UserDocument } from "./schemas/user.schema";

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>
  ) {}

  async findByPhoneNumber(phoneNumber: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ phoneNumber }).exec();
  }

  async findById(userId: string): Promise<UserDocument> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException("User not found");
    }
    return user;
  }

  async create(payload: {
    phoneNumber: string;
    passwordHash?: string;
    name?: string;
    gender?: "male" | "female" | "other";
    timezone?: string;
    isActive?: boolean;
    isVerified?: boolean;
    registrationOtpHash?: string;
    registrationOtpExpiresAt?: Date;
    registrationVerifiedAt?: Date;
  }): Promise<UserDocument> {
    try {
      const createdUser = new this.userModel({
        ...payload,
        timezone: payload.timezone ?? "UTC",
        isActive: payload.isActive ?? false,
        isVerified: payload.isVerified ?? false
      });
      return await createdUser.save();
    } catch (error: unknown) {
      if (this.isDuplicatePhoneNumberError(error)) {
        throw new ConflictException("Phone number already in use");
      }
      throw error;
    }
  }

  async upsertPendingRegistration(payload: {
    phoneNumber: string;
    registrationOtpHash: string;
    registrationOtpExpiresAt: Date;
  }): Promise<UserDocument> {
    try {
      const user = await this.userModel
        .findOneAndUpdate(
          { phoneNumber: payload.phoneNumber, isActive: false },
          {
            $set: {
              phoneNumber: payload.phoneNumber,
              isActive: false,
              isVerified: false,
              registrationOtpHash: payload.registrationOtpHash,
              registrationOtpExpiresAt: payload.registrationOtpExpiresAt
            },
            $unset: {
              registrationVerifiedAt: 1,
              passwordHash: 1,
              name: 1,
              gender: 1
            }
          },
          {
            new: true,
            upsert: true,
            runValidators: true,
            setDefaultsOnInsert: true
          }
        )
        .exec();

      if (!user) {
        throw new NotFoundException("User not found");
      }

      return user;
    } catch (error: unknown) {
      if (this.isDuplicatePhoneNumberError(error)) {
        throw new ConflictException("Phone number already in use");
      }
      throw error;
    }
  }

  async upsertVerifiedRegistrationCandidate(phoneNumber: string): Promise<UserDocument> {
    try {
      const user = await this.userModel
        .findOneAndUpdate(
          { phoneNumber, isActive: false },
          {
            $set: {
              phoneNumber,
              isActive: false,
              isVerified: true,
              registrationVerifiedAt: new Date()
            },
            $unset: {
              registrationOtpHash: 1,
              registrationOtpExpiresAt: 1
            }
          },
          {
            new: true,
            upsert: true,
            runValidators: true,
            setDefaultsOnInsert: true
          }
        )
        .exec();

      if (!user) {
        throw new NotFoundException("User not found");
      }

      return user;
    } catch (error: unknown) {
      if (this.isDuplicatePhoneNumberError(error)) {
        throw new ConflictException("Phone number already in use");
      }
      throw error;
    }
  }

  async markPhoneVerified(userId: string): Promise<UserDocument> {
    const user = await this.userModel
      .findByIdAndUpdate(
        userId,
        {
          $set: {
            isVerified: true,
            isActive: false,
            registrationVerifiedAt: new Date()
          },
          $unset: {
            registrationOtpHash: 1,
            registrationOtpExpiresAt: 1
          }
        },
        {
          new: true,
          runValidators: true
        }
      )
      .exec();

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return user;
  }

  async completePendingRegistration(
    userId: string,
    payload: {
      passwordHash: string;
      name: string;
      gender?: "male" | "female" | "other";
      timezone?: string;
    }
  ): Promise<UserDocument> {
    const user = await this.userModel
      .findByIdAndUpdate(
        userId,
        {
          $set: {
            ...payload,
            timezone: payload.timezone ?? "UTC",
            isVerified: true,
            isActive: true
          },
          $unset: {
            registrationOtpHash: 1,
            registrationOtpExpiresAt: 1,
            registrationVerifiedAt: 1
          }
        },
        {
          new: true,
          runValidators: true
        }
      )
      .exec();

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return user;
  }

  async upsertPasswordResetOtp(payload: {
    userId: string;
    passwordResetOtpHash: string;
    passwordResetOtpExpiresAt: Date;
  }): Promise<UserDocument> {
    const user = await this.userModel
      .findByIdAndUpdate(
        payload.userId,
        {
          $set: {
            passwordResetOtpHash: payload.passwordResetOtpHash,
            passwordResetOtpExpiresAt: payload.passwordResetOtpExpiresAt
          },
          $unset: {
            passwordResetVerifiedAt: 1
          }
        },
        {
          new: true,
          runValidators: true
        }
      )
      .exec();

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return user;
  }

  async markPasswordResetVerified(userId: string): Promise<UserDocument> {
    const user = await this.userModel
      .findByIdAndUpdate(
        userId,
        {
          $set: {
            passwordResetVerifiedAt: new Date()
          },
          $unset: {
            passwordResetOtpHash: 1,
            passwordResetOtpExpiresAt: 1
          }
        },
        {
          new: true,
          runValidators: true
        }
      )
      .exec();

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return user;
  }

  async resetPassword(
    userId: string,
    payload: {
      passwordHash: string;
    }
  ): Promise<UserDocument> {
    const user = await this.userModel
      .findByIdAndUpdate(
        userId,
        {
          $set: {
            passwordHash: payload.passwordHash
          },
          $unset: {
            passwordResetOtpHash: 1,
            passwordResetOtpExpiresAt: 1,
            passwordResetVerifiedAt: 1
          }
        },
        {
          new: true,
          runValidators: true
        }
      )
      .exec();

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return user;
  }

  async updateProfile(
    userId: string,
    payload: UpdateProfileDto
  ): Promise<UserDocument> {
    const updatedUser = await this.userModel
      .findByIdAndUpdate(userId, payload, {
        new: true,
        runValidators: true
      })
      .exec();
    if (!updatedUser) {
      throw new NotFoundException("User not found");
    }
    return updatedUser;
  }

  toProfileResponse(user: UserDocument): ProfileResponseDto {
    return {
      id: user.id,
      phoneNumber: user.phoneNumber,
      name: user.name,
      heightCm: user.heightCm,
      gender: user.gender,
      timezone: user.timezone,
      startingWeightKg: user.startingWeightKg,
      targetWeightKg: user.targetWeightKg,
      dailyWaterTargetMl: user.dailyWaterTargetMl,
      isActive: user.isActive,
      isVerified: user.isVerified,
      isProfileCompleted: this.isProfileCompleted(user),
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString()
    };
  }

  private isProfileCompleted(user: UserDocument): boolean {
    return Boolean(
      user.heightCm &&
        user.timezone &&
        user.dailyWaterTargetMl &&
        user.dailyWaterTargetMl > 0
    );
  }

  private isDuplicatePhoneNumberError(error: unknown): boolean {
    if (typeof error !== "object" || error === null) {
      return false;
    }
    return "code" in error && (error as { code?: number }).code === 11000;
  }
}
