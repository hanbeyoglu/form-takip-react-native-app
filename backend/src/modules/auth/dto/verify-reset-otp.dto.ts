import { IsString, Length } from "class-validator";

export class VerifyResetOtpDto {
  @IsString()
  phoneNumber!: string;

  @IsString()
  @Length(6, 6)
  code!: string;
}
