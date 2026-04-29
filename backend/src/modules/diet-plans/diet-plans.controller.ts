import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UnauthorizedException,
  UseGuards
} from "@nestjs/common";

import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { AddMealDto } from "./dto/add-meal.dto";
import { CreateDietPlanDto } from "./dto/create-diet-plan.dto";
import {
  ActivateDietPlanResponseDto,
  DietPlanResponseDto
} from "./dto/diet-plan-response.dto";
import { UpdateDietPlanDto } from "./dto/update-diet-plan.dto";
import { UpdateMealDto } from "./dto/update-meal.dto";
import { DietPlansService } from "./diet-plans.service";

@Controller("diet-plans")
@UseGuards(JwtAuthGuard)
export class DietPlansController {
  constructor(private readonly dietPlansService: DietPlansService) {}

  @Post()
  createDietPlan(
    @CurrentUser("sub") userId: string | null,
    @Body() payload: CreateDietPlanDto
  ): Promise<DietPlanResponseDto> {
    if (!userId) {
      throw new UnauthorizedException("Missing user context");
    }
    return this.dietPlansService.createDietPlan(userId, payload);
  }

  @Get("active")
  getActiveDietPlan(
    @CurrentUser("sub") userId: string | null
  ): Promise<DietPlanResponseDto | null> {
    if (!userId) {
      throw new UnauthorizedException("Missing user context");
    }
    return this.dietPlansService.getActiveDietPlan(userId);
  }

  @Get("history")
  getDietPlanHistory(
    @CurrentUser("sub") userId: string | null
  ): Promise<DietPlanResponseDto[]> {
    if (!userId) {
      throw new UnauthorizedException("Missing user context");
    }
    return this.dietPlansService.getDietPlanHistory(userId);
  }

  @Get(":id")
  getDietPlanById(
    @CurrentUser("sub") userId: string | null,
    @Param("id") id: string
  ): Promise<DietPlanResponseDto> {
    if (!userId) {
      throw new UnauthorizedException("Missing user context");
    }
    return this.dietPlansService.getDietPlanById(userId, id);
  }

  @Patch(":id")
  updateDietPlan(
    @CurrentUser("sub") userId: string | null,
    @Param("id") id: string,
    @Body() payload: UpdateDietPlanDto
  ): Promise<DietPlanResponseDto> {
    if (!userId) {
      throw new UnauthorizedException("Missing user context");
    }
    return this.dietPlansService.updateDietPlan(userId, id, payload);
  }

  @Post(":id/activate")
  activateDietPlan(
    @CurrentUser("sub") userId: string | null,
    @Param("id") id: string
  ): Promise<ActivateDietPlanResponseDto> {
    if (!userId) {
      throw new UnauthorizedException("Missing user context");
    }
    return this.dietPlansService.activateDietPlan(userId, id);
  }

  @Post(":id/meals")
  addMeal(
    @CurrentUser("sub") userId: string | null,
    @Param("id") id: string,
    @Body() payload: AddMealDto
  ): Promise<DietPlanResponseDto> {
    if (!userId) {
      throw new UnauthorizedException("Missing user context");
    }
    return this.dietPlansService.addMeal(userId, id, payload);
  }

  @Patch(":id/meals/:mealId")
  updateMeal(
    @CurrentUser("sub") userId: string | null,
    @Param("id") id: string,
    @Param("mealId") mealId: string,
    @Body() payload: UpdateMealDto
  ): Promise<DietPlanResponseDto> {
    if (!userId) {
      throw new UnauthorizedException("Missing user context");
    }
    return this.dietPlansService.updateMeal(userId, id, mealId, payload);
  }

  @Delete(":id/meals/:mealId")
  deleteMeal(
    @CurrentUser("sub") userId: string | null,
    @Param("id") id: string,
    @Param("mealId") mealId: string
  ): Promise<DietPlanResponseDto> {
    if (!userId) {
      throw new UnauthorizedException("Missing user context");
    }
    return this.dietPlansService.deleteMeal(userId, id, mealId);
  }
}
