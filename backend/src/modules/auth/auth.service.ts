import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

import {
  isValidTurkishMobile,
  normalizePhoneNumber
} from "../../common/utils/phone.util";
import { hashPassword, verifyPassword } from "../../common/utils/password.util";
import { UsersService } from "../users/users.service";
import { CompleteRegistrationDto } from "./dto/complete-registration.dto";
import { LoginDto } from "./dto/login.dto";
import { AuthResponseDto } from "./dto/auth-response.dto";
import { RequestPasswordResetOtpDto } from "./dto/request-password-reset-otp.dto";
import { RequestPasswordResetOtpResponseDto } from "./dto/request-password-reset-otp-response.dto";
import { RequestRegisterOtpDto } from "./dto/request-register-otp.dto";
import { RequestRegisterOtpResponseDto } from "./dto/request-register-otp-response.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { VerifyRegisterOtpDto } from "./dto/verify-register-otp.dto";
import { VerifyRegisterOtpResponseDto } from "./dto/verify-register-otp-response.dto";
import { VerifyResetOtpDto } from "./dto/verify-reset-otp.dto";
import { VerifyResetOtpResponseDto } from "./dto/verify-reset-otp-response.dto";
import { JwtPayload } from "./types/jwt-payload.type";
import { FirebasePhoneAuthService } from "./firebase-phone-auth.service";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly firebasePhoneAuthService: FirebasePhoneAuthService
  ) {}

  async requestRegisterOtp(
    requestRegisterOtpDto: RequestRegisterOtpDto
  ): Promise<RequestRegisterOtpResponseDto> {
    void requestRegisterOtpDto;
    throw new BadRequestException("Firebase phone verification is required");
  }

  async verifyRegisterOtp(
    verifyRegisterOtpDto: VerifyRegisterOtpDto
  ): Promise<VerifyRegisterOtpResponseDto> {
    void verifyRegisterOtpDto;
    throw new BadRequestException("Firebase phone verification is required");
  }

  async completeRegistration(
    completeRegistrationDto: CompleteRegistrationDto
  ): Promise<AuthResponseDto> {
    const { phoneNumber } = await this.firebasePhoneAuthService.verifyPhoneIdentityToken({
      idToken: completeRegistrationDto.firebaseIdToken,
      expectedPhoneNumber: completeRegistrationDto.phoneNumber
    });

    const existingUser = await this.usersService.findByPhoneNumber(phoneNumber);
    if (existingUser?.isActive) {
      throw new ConflictException("Phone number already in use");
    }

    const user = await this.usersService.upsertVerifiedRegistrationCandidate(phoneNumber);
    const passwordHash = await hashPassword(completeRegistrationDto.password);
    const completedUser = await this.usersService.completePendingRegistration(user.id, {
      passwordHash,
      name: completeRegistrationDto.name,
      gender: completeRegistrationDto.gender,
      timezone: completeRegistrationDto.timezone
    });

    const token = this.issueAccessToken({
      sub: completedUser.id,
      phoneNumber: completedUser.phoneNumber
    });

    return {
      accessToken: token,
      profile: this.usersService.toProfileResponse(completedUser)
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const phoneNumber = this.normalizeAndValidatePhoneNumber(loginDto.phoneNumber);
    const user = await this.usersService.findByPhoneNumber(phoneNumber);
    if (!user || !user.isActive || !user.isVerified || !user.passwordHash) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const isValidPassword = await verifyPassword(
      loginDto.password,
      user.passwordHash
    );
    if (!isValidPassword) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const token = this.issueAccessToken({
      sub: user.id,
      phoneNumber: user.phoneNumber
    });
    return {
      accessToken: token,
      profile: this.usersService.toProfileResponse(user)
    };
  }

  async requestPasswordResetOtp(
    requestPasswordResetOtpDto: RequestPasswordResetOtpDto
  ): Promise<RequestPasswordResetOtpResponseDto> {
    void requestPasswordResetOtpDto;
    throw new BadRequestException("Firebase phone verification is required");
  }

  async verifyResetOtp(
    verifyResetOtpDto: VerifyResetOtpDto
  ): Promise<VerifyResetOtpResponseDto> {
    void verifyResetOtpDto;
    throw new BadRequestException("Firebase phone verification is required");
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<void> {
    const { phoneNumber } = await this.firebasePhoneAuthService.verifyPhoneIdentityToken({
      idToken: resetPasswordDto.firebaseIdToken,
      expectedPhoneNumber: resetPasswordDto.phoneNumber
    });

    const user = await this.usersService.findByPhoneNumber(phoneNumber);
    if (!user || !user.isActive || !user.isVerified || !user.passwordHash) {
      throw new NotFoundException("Phone number not found");
    }

    const passwordHash = await hashPassword(resetPasswordDto.password);
    await this.usersService.resetPassword(user.id, {
      passwordHash
    });
  }

  private issueAccessToken(payload: JwtPayload): string {
    return this.jwtService.sign(payload);
  }
  private normalizeAndValidatePhoneNumber(input: string): string {
    const normalizedPhoneNumber = normalizePhoneNumber(input);
    if (!isValidTurkishMobile(normalizedPhoneNumber)) {
      throw new BadRequestException("Only Turkish GSM phone numbers are allowed");
    }
    return normalizedPhoneNumber;
  }
}
