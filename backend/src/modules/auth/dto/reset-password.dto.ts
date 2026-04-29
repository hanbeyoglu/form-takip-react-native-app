import { IsString, MinLength } from "class-validator";

export class ResetPasswordDto {
  @IsString()
  phoneNumber!: string;

  @IsString()
  firebaseIdToken!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}
