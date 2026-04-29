import { IsString } from "class-validator";

export class RequestRegisterOtpDto {
  @IsString()
  phoneNumber!: string;
}
