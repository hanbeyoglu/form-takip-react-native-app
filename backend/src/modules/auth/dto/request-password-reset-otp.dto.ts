import { IsString } from "class-validator";

export class RequestPasswordResetOtpDto {
  @IsString()
  phoneNumber!: string;
}
