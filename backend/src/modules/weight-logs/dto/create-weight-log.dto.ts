import { IsDateString, IsNumber, IsOptional, IsString, Max, Min } from "class-validator";

export class CreateWeightLogDto {
  @IsNumber()
  @Min(30)
  @Max(350)
  weightKg!: number;

  @IsDateString()
  loggedAt!: string;

  @IsOptional()
  @IsString()
  note?: string;
}
