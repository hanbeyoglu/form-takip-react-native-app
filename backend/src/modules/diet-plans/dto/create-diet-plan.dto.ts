import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  ValidateNested
} from "class-validator";
import { Type } from "class-transformer";

import { MealDto } from "./meal.dto";

export class CreateDietPlanDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: "weekStartDate must be in YYYY-MM-DD format"
  })
  weekStartDate!: string;

  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: "weekEndDate must be in YYYY-MM-DD format"
  })
  weekEndDate!: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => MealDto)
  meals!: MealDto[];

  @IsOptional()
  @IsBoolean()
  activateNow?: boolean;
}
