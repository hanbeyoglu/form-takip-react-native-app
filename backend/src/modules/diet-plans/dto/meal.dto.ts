import {
  ArrayNotEmpty,
  IsArray,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Min
} from "class-validator";

export class MealDto {
  @IsOptional()
  @IsString()
  @Matches(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    { message: "mealId must be a valid UUID" }
  )
  mealId?: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: "time must be in HH:mm format"
  })
  time!: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsInt()
  @Min(1)
  order!: number;

  @IsOptional()
  @IsIn(["every_day", "selected_dates"])
  appliesToType?: "every_day" | "selected_dates";

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    each: true,
    message: "appliesToDates must contain YYYY-MM-DD values"
  })
  appliesToDates?: string[];
}
