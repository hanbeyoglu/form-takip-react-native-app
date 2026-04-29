export interface JwtPayload {
  sub: string;
  phoneNumber: string;
}

export interface RegistrationTokenPayload extends JwtPayload {
  purpose: "registration";
}

export interface PasswordResetTokenPayload extends JwtPayload {
  purpose: "password-reset";
}
