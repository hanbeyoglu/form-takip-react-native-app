export interface RequestRegisterOtpResponseDto {
  phoneNumber: string;
  otpExpiresAt: string;
  otpCode?: string;
}
