import {
  BadRequestException,
  Injectable,
  NotFoundException
} from "@nestjs/common";
import { randomUUID } from "crypto";
import { Types } from "mongoose";

import { AddMealDto } from "./dto/add-meal.dto";
import { CreateDietPlanDto } from "./dto/create-diet-plan.dto";
import {
  ActivateDietPlanResponseDto,
  DietPlanResponseDto,
  MealResponseDto
} from "./dto/diet-plan-response.dto";
import { UpdateDietPlanDto } from "./dto/update-diet-plan.dto";
import { UpdateMealDto } from "./dto/update-meal.dto";
import { DietPlansRepository } from "./repositories/diet-plans.repository";
import {
  DietPlanDocument,
  DietPlanStatus,
  MealEntry
} from "./schemas/diet-plan.schema";
import {
  getUtcDateRange
} from "./utils/meal-applicability.util";

@Injectable()
export class DietPlansService {
  constructor(private readonly dietPlansRepository: DietPlansRepository) {}

  async createDietPlan(
    userId: string,
    payload: CreateDietPlanDto
  ): Promise<DietPlanResponseDto> {
    this.assertDateRange(payload.weekStartDate, payload.weekEndDate);
    this.assertMealOrders(payload.meals);
    this.assertMealIdentifiers(payload.meals);
    this.assertMealApplicability(
      payload.meals,
      payload.weekStartDate,
      payload.weekEndDate
    );

    const latestPlan = await this.dietPlansRepository.findLatestPlanByUserId(userId);
    const nextVersion = latestPlan ? latestPlan.version + 1 : 1;

    if (payload.activateNow) {
      await this.dietPlansRepository.archiveActivePlans(userId);
    }

    const createdPlan = await this.dietPlansRepository.create({
      userId: new Types.ObjectId(userId),
      title: payload.title.trim(),
      weekStartDate: this.toUtcDayStart(payload.weekStartDate),
      weekEndDate: this.toUtcDayEnd(payload.weekEndDate),
      status: payload.activateNow ? DietPlanStatus.Active : DietPlanStatus.Archived,
      version: nextVersion,
      notes: payload.notes?.trim(),
      meals: this.normalizeMeals(payload.meals)
    });

    return this.toResponse(createdPlan);
  }

  async getActiveDietPlan(userId: string): Promise<DietPlanResponseDto | null> {
    const activePlan = await this.dietPlansRepository.findActiveByUserId(userId);
    return activePlan ? this.toResponse(activePlan) : null;
  }

  async getDietPlanHistory(userId: string): Promise<DietPlanResponseDto[]> {
    const history = await this.dietPlansRepository.findHistoryByUserId(userId);
    return history.map((plan) => this.toResponse(plan));
  }

  async getDietPlanById(userId: string, dietPlanId: string): Promise<DietPlanResponseDto> {
    const plan = await this.getOwnedPlanOrThrow(userId, dietPlanId);
    return this.toResponse(plan);
  }

  async updateDietPlan(
    userId: string,
    dietPlanId: string,
    payload: UpdateDietPlanDto
  ): Promise<DietPlanResponseDto> {
    const plan = await this.getOwnedPlanOrThrow(userId, dietPlanId);

    const nextWeekStart = payload.weekStartDate ?? plan.weekStartDate.toISOString();
    const nextWeekEnd = payload.weekEndDate ?? plan.weekEndDate.toISOString();
    const normalizedWeekStart = this.normalizeDateStringInput(nextWeekStart);
    const normalizedWeekEnd = this.normalizeDateStringInput(nextWeekEnd);
    this.assertDateRange(normalizedWeekStart, normalizedWeekEnd);

    if (payload.meals) {
      this.assertMealOrders(payload.meals);
      this.assertMealIdentifiers(payload.meals);
      this.assertMealApplicability(payload.meals, normalizedWeekStart, normalizedWeekEnd);
      plan.meals = this.normalizeMeals(payload.meals);
    }

    if (payload.title !== undefined) {
      plan.title = payload.title.trim();
    }
    if (payload.weekStartDate !== undefined) {
      plan.weekStartDate = this.toUtcDayStart(payload.weekStartDate);
    }
    if (payload.weekEndDate !== undefined) {
      plan.weekEndDate = this.toUtcDayEnd(payload.weekEndDate);
    }
    if (payload.notes !== undefined) {
      plan.notes = payload.notes.trim();
    }

    const updatedPlan = await this.dietPlansRepository.save(plan);
    return this.toResponse(updatedPlan);
  }

  async activateDietPlan(
    userId: string,
    dietPlanId: string
  ): Promise<ActivateDietPlanResponseDto> {
    const plan = await this.getOwnedPlanOrThrow(userId, dietPlanId);
    const archivedPlanIds = await this.dietPlansRepository.archiveActivePlans(
      userId,
      dietPlanId
    );
    plan.status = DietPlanStatus.Active;
    const updatedPlan = await this.dietPlansRepository.save(plan);
    return {
      activePlan: this.toResponse(updatedPlan),
      previousActivePlanId: archivedPlanIds[0] ?? null,
      requiresNotificationReschedule: true
    };
  }

  async addMeal(
    userId: string,
    dietPlanId: string,
    payload: AddMealDto
  ): Promise<DietPlanResponseDto> {
    const plan = await this.getOwnedPlanOrThrow(userId, dietPlanId);
    const meal: MealEntry = {
      mealId: randomUUID(),
      name: payload.name.trim(),
      time: payload.time,
      note: payload.note?.trim(),
      order: payload.order,
      appliesToType: payload.appliesToType ?? "every_day",
      appliesToDates: this.normalizeMealAppliesToDates(payload.appliesToDates)
    };
    this.assertMealApplicability(
      [meal],
      plan.weekStartDate.toISOString().slice(0, 10),
      plan.weekEndDate.toISOString().slice(0, 10)
    );
    const nextMeals = [...plan.meals, meal];
    this.assertMealOrders(nextMeals);
    const updatedPlan = await this.dietPlansRepository.replaceMeals(plan, nextMeals);
    return this.toResponse(updatedPlan);
  }

  async updateMeal(
    userId: string,
    dietPlanId: string,
    mealId: string,
    payload: UpdateMealDto
  ): Promise<DietPlanResponseDto> {
    const plan = await this.getOwnedPlanOrThrow(userId, dietPlanId);
    const mealIndex = plan.meals.findIndex((meal) => meal.mealId === mealId);
    if (mealIndex === -1) {
      throw new NotFoundException("Meal not found");
    }
    const currentMeal = plan.meals[mealIndex];
    const nextMeal: MealEntry = {
      ...currentMeal,
      name: payload.name !== undefined ? payload.name.trim() : currentMeal.name,
      time: payload.time ?? currentMeal.time,
      note: payload.note !== undefined ? payload.note.trim() : currentMeal.note,
      order: payload.order ?? currentMeal.order,
      appliesToType: payload.appliesToType ?? currentMeal.appliesToType ?? "every_day",
      appliesToDates:
        payload.appliesToDates !== undefined
          ? this.normalizeMealAppliesToDates(payload.appliesToDates)
          : currentMeal.appliesToDates ?? []
    };
    const nextMeals = [...plan.meals];
    nextMeals[mealIndex] = nextMeal;
    this.assertMealOrders(nextMeals);
    this.assertMealApplicability(
      nextMeals,
      plan.weekStartDate.toISOString().slice(0, 10),
      plan.weekEndDate.toISOString().slice(0, 10)
    );
    const updatedPlan = await this.dietPlansRepository.replaceMeals(plan, nextMeals);
    return this.toResponse(updatedPlan);
  }

  async deleteMeal(
    userId: string,
    dietPlanId: string,
    mealId: string
  ): Promise<DietPlanResponseDto> {
    const plan = await this.getOwnedPlanOrThrow(userId, dietPlanId);
    const exists = plan.meals.some((meal) => meal.mealId === mealId);
    if (!exists) {
      throw new NotFoundException("Meal not found");
    }
    const updatedPlan = await this.dietPlansRepository.deleteMeal(plan, mealId);
    return this.toResponse(updatedPlan);
  }

  private async getOwnedPlanOrThrow(
    userId: string,
    dietPlanId: string
  ): Promise<DietPlanDocument> {
    if (!Types.ObjectId.isValid(dietPlanId)) {
      throw new BadRequestException("Invalid diet plan id");
    }
    const plan = await this.dietPlansRepository.findByIdAndUserId(dietPlanId, userId);
    if (!plan) {
      throw new NotFoundException("Diet plan not found");
    }
    return plan;
  }

  private assertDateRange(weekStartDate: string, weekEndDate: string): void {
    const start = this.toUtcDayStart(weekStartDate);
    const end = this.toUtcDayEnd(weekEndDate);
    if (end.getTime() < start.getTime()) {
      throw new BadRequestException("weekEndDate must be greater or equal weekStartDate");
    }
  }

  private assertMealOrders(meals: Array<{ order: number }>): void {
    const orderSet = new Set<number>();
    for (const meal of meals) {
      if (orderSet.has(meal.order)) {
        throw new BadRequestException("Meal order must be unique");
      }
      orderSet.add(meal.order);
    }
  }

  private assertMealIdentifiers(meals: Array<{ mealId?: string }>): void {
    const idSet = new Set<string>();
    for (const meal of meals) {
      if (!meal.mealId) {
        continue;
      }
      if (idSet.has(meal.mealId)) {
        throw new BadRequestException("Meal mealId must be unique");
      }
      idSet.add(meal.mealId);
    }
  }

  private normalizeMeals(
    meals: Array<{
      mealId?: string;
      name: string;
      time: string;
      note?: string;
      order: number;
      appliesToType?: "every_day" | "selected_dates";
      appliesToDates?: string[];
    }>
  ): MealEntry[] {
    return [...meals]
      .sort((a, b) => a.order - b.order)
      .map((meal) => ({
        mealId: meal.mealId ?? randomUUID(),
        name: meal.name.trim(),
        time: meal.time,
        note: meal.note?.trim(),
        order: meal.order,
        appliesToType: meal.appliesToType ?? "every_day",
        appliesToDates: this.normalizeMealAppliesToDates(meal.appliesToDates)
      }));
  }

  private normalizeMealAppliesToDates(appliesToDates?: string[]): string[] {
    if (!appliesToDates) {
      return [];
    }

    return [...new Set(appliesToDates.map((date) => this.normalizeDateStringInput(date)))].sort();
  }

  private assertMealApplicability(
    meals: Array<{
      appliesToType?: "every_day" | "selected_dates";
      appliesToDates?: string[];
    }>,
    weekStartDate: string,
    weekEndDate: string
  ): void {
    const allowedDates = new Set(getUtcDateRange(weekStartDate, weekEndDate));

    for (const meal of meals) {
      const appliesToType = meal.appliesToType ?? "every_day";
      const appliesToDates = this.normalizeMealAppliesToDates(meal.appliesToDates);

      if (appliesToType === "selected_dates" && appliesToDates.length === 0) {
        throw new BadRequestException(
          "selected_dates meals must include at least one appliesToDate"
        );
      }

      for (const date of appliesToDates) {
        if (!allowedDates.has(date)) {
          throw new BadRequestException(
            "Meal appliesToDates must stay within the plan date range"
          );
        }
      }
    }
  }

  private toUtcDayStart(dateInput: string): Date {
    const normalized = this.normalizeDateStringInput(dateInput);
    return new Date(`${normalized}T00:00:00.000Z`);
  }

  private toUtcDayEnd(dateInput: string): Date {
    const normalized = this.normalizeDateStringInput(dateInput);
    return new Date(`${normalized}T23:59:59.999Z`);
  }

  private normalizeDateStringInput(dateInput: string): string {
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
      return dateInput;
    }
    const date = new Date(dateInput);
    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException("Invalid date format");
    }
    return date.toISOString().slice(0, 10);
  }

  private toResponse(plan: DietPlanDocument): DietPlanResponseDto {
    const meals: MealResponseDto[] = [...plan.meals]
      .sort((a, b) => a.order - b.order)
      .map((meal) => ({
        mealId: meal.mealId,
        name: meal.name,
        time: meal.time,
        note: meal.note,
        order: meal.order,
        appliesToType: meal.appliesToType ?? "every_day",
        appliesToDates:
          meal.appliesToType === "selected_dates" ? meal.appliesToDates ?? [] : undefined
      }));

    return {
      id: plan.id,
      userId: plan.userId.toString(),
      title: plan.title,
      weekStartDate: plan.weekStartDate.toISOString().slice(0, 10),
      weekEndDate: plan.weekEndDate.toISOString().slice(0, 10),
      status: plan.status,
      version: plan.version,
      notes: plan.notes,
      meals,
      scheduleKey: `${plan.id}:${plan.version}:${plan.updatedAt.toISOString()}`,
      createdAt: plan.createdAt.toISOString(),
      updatedAt: plan.updatedAt.toISOString()
    };
  }
}
