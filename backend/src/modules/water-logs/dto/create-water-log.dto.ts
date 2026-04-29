import { IsDateString, IsEnum, IsInt, Max, Min } from "class-validator";

import { WaterLogSource } from "../schemas/water-log.schema";

export class CreateWaterLogDto {
  @IsInt()
  @Min(50)
  @Max(5000)
  amountMl!: number;

  @IsDateString()
  loggedAt!: string;

  @IsEnum(WaterLogSource)
  source!: WaterLogSource;
}
