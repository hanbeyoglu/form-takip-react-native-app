import { apiClient } from "../../../services/api/client";
import {
  ActivateDietPlanResult,
  CreateDietPlanInput,
  DietPlan,
  MealInput,
  UpdateDietPlanInput,
  UpdateMealInput
} from "../../../types/diet-plan.types";

class DietPlanService {
  createPlan(payload: CreateDietPlanInput): Promise<DietPlan> {
    return apiClient.postData<DietPlan, CreateDietPlanInput>("/diet-plans", payload);
  }

  getActivePlan(): Promise<DietPlan | null> {
    return apiClient.getData<DietPlan | null>("/diet-plans/active");
  }

  getPlanHistory(): Promise<DietPlan[]> {
    return apiClient.getData<DietPlan[]>("/diet-plans/history");
  }

  getPlanById(planId: string): Promise<DietPlan> {
    return apiClient.getData<DietPlan>(`/diet-plans/${planId}`);
  }

  updatePlan(planId: string, payload: UpdateDietPlanInput): Promise<DietPlan> {
    return apiClient.patchData<DietPlan, UpdateDietPlanInput>(
      `/diet-plans/${planId}`,
      payload
    );
  }

  activatePlan(planId: string): Promise<ActivateDietPlanResult> {
    return apiClient.postData<ActivateDietPlanResult, Record<string, never>>(
      `/diet-plans/${planId}/activate`,
      {}
    );
  }

  addMeal(planId: string, payload: MealInput): Promise<DietPlan> {
    return apiClient.postData<DietPlan, MealInput>(
      `/diet-plans/${planId}/meals`,
      payload
    );
  }

  updateMeal(
    planId: string,
    mealId: string,
    payload: UpdateMealInput
  ): Promise<DietPlan> {
    return apiClient.patchData<DietPlan, UpdateMealInput>(
      `/diet-plans/${planId}/meals/${mealId}`,
      payload
    );
  }

  deleteMeal(planId: string, mealId: string): Promise<DietPlan> {
    return apiClient.deleteData<DietPlan>(`/diet-plans/${planId}/meals/${mealId}`);
  }
}

export const dietPlanService = new DietPlanService();
