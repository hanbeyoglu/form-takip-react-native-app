import { IsEnum, IsNumber, IsOptional, IsString, Max, Min } from "class-validator";

enum Gender {
  Male = "male",
  Female = "female",
  Other = "other"
}

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  @Min(100)
  @Max(260)
  heightCm?: number;

  @IsOptional()
  @IsEnum(Gender)
  gender?: "male" | "female" | "other";

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsNumber()
  @Min(30)
  @Max(350)
  startingWeightKg?: number;

  @IsOptional()
  @IsNumber()
  @Min(30)
  @Max(350)
  targetWeightKg?: number;

  @IsOptional()
  @IsNumber()
  @Min(500)
  @Max(6000)
  dailyWaterTargetMl?: number;
}
