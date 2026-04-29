export interface RequestPasswordResetOtpResponseDto {
  phoneNumber: string;
  otpExpiresAt: string;
  otpCode?: string;
}
