import { Body, Controller, Post } from "@nestjs/common";

import { AuthService } from "./auth.service";
import { AuthResponseDto } from "./dto/auth-response.dto";
import { CompleteRegistrationDto } from "./dto/complete-registration.dto";
import { LoginDto } from "./dto/login.dto";
import { RequestPasswordResetOtpDto } from "./dto/request-password-reset-otp.dto";
import { RequestPasswordResetOtpResponseDto } from "./dto/request-password-reset-otp-response.dto";
import { RequestRegisterOtpDto } from "./dto/request-register-otp.dto";
import { RequestRegisterOtpResponseDto } from "./dto/request-register-otp-response.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { VerifyRegisterOtpDto } from "./dto/verify-register-otp.dto";
import { VerifyRegisterOtpResponseDto } from "./dto/verify-register-otp-response.dto";
import { VerifyResetOtpDto } from "./dto/verify-reset-otp.dto";
import { VerifyResetOtpResponseDto } from "./dto/verify-reset-otp-response.dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("request-register-otp")
  requestRegisterOtp(
    @Body() requestRegisterOtpDto: RequestRegisterOtpDto
  ): Promise<RequestRegisterOtpResponseDto> {
    return this.authService.requestRegisterOtp(requestRegisterOtpDto);
  }

  @Post("verify-register-otp")
  verifyRegisterOtp(
    @Body() verifyRegisterOtpDto: VerifyRegisterOtpDto
  ): Promise<VerifyRegisterOtpResponseDto> {
    return this.authService.verifyRegisterOtp(verifyRegisterOtpDto);
  }

  @Post("complete-registration")
  completeRegistration(
    @Body() completeRegistrationDto: CompleteRegistrationDto
  ): Promise<AuthResponseDto> {
    return this.authService.completeRegistration(completeRegistrationDto);
  }

  @Post("request-password-reset-otp")
  requestPasswordResetOtp(
    @Body() requestPasswordResetOtpDto: RequestPasswordResetOtpDto
  ): Promise<RequestPasswordResetOtpResponseDto> {
    return this.authService.requestPasswordResetOtp(requestPasswordResetOtpDto);
  }

  @Post("verify-reset-otp")
  verifyResetOtp(
    @Body() verifyResetOtpDto: VerifyResetOtpDto
  ): Promise<VerifyResetOtpResponseDto> {
    return this.authService.verifyResetOtp(verifyResetOtpDto);
  }

  @Post("verify-password-reset-otp")
  verifyPasswordResetOtp(
    @Body() verifyResetOtpDto: VerifyResetOtpDto
  ): Promise<VerifyResetOtpResponseDto> {
    return this.authService.verifyResetOtp(verifyResetOtpDto);
  }

  @Post("reset-password")
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto): Promise<void> {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Post("login")
  login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }
}
