import {
  IsIn,
  IsOptional,
  IsString,
  Matches,
  MinLength
} from "class-validator";

export class CompleteRegistrationDto {
  @IsString()
  phoneNumber!: string;

  @IsString()
  firebaseIdToken!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  @MinLength(2)
  name!: string;

  @IsOptional()
  @IsIn(["male", "female", "other"])
  gender?: "male" | "female" | "other";

  @IsOptional()
  @IsString()
  @Matches(/^[A-Za-z_]+\/[A-Za-z_]+$/, {
    message: "timezone must be in Area/City format"
  })
  timezone?: string;
}
