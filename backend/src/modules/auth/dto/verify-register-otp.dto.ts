import { IsString, Length } from "class-validator";

export class VerifyRegisterOtpDto {
  @IsString()
  phoneNumber!: string;

  @IsString()
  @Length(6, 6)
  code!: string;
}
