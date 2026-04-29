import {
  IsArray,
  IsOptional,
  IsString,
  Matches,
  ValidateNested
} from "class-validator";
import { Type } from "class-transformer";

import { MealDto } from "./meal.dto";

export class UpdateDietPlanDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: "weekStartDate must be in YYYY-MM-DD format"
  })
  weekStartDate?: string;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: "weekEndDate must be in YYYY-MM-DD format"
  })
  weekEndDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MealDto)
  meals?: MealDto[];
}
