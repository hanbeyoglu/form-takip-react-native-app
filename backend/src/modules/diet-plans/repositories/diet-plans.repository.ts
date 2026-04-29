import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";

import {
  DietPlan,
  DietPlanDocument,
  DietPlanStatus,
  MealEntry
} from "../schemas/diet-plan.schema";

@Injectable()
export class DietPlansRepository {
  constructor(
    @InjectModel(DietPlan.name)
    private readonly dietPlanModel: Model<DietPlanDocument>
  ) {}

  create(payload: Partial<DietPlan>): Promise<DietPlanDocument> {
    const model = new this.dietPlanModel(payload);
    return model.save();
  }

  countByUserId(userId: string): Promise<number> {
    return this.dietPlanModel.countDocuments({ userId: new Types.ObjectId(userId) }).exec();
  }

  findLatestPlanByUserId(userId: string): Promise<DietPlanDocument | null> {
    return this.dietPlanModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .sort({ version: -1, createdAt: -1 })
      .exec();
  }

  findActiveByUserId(userId: string): Promise<DietPlanDocument | null> {
    return this.dietPlanModel
      .findOne({
        userId: new Types.ObjectId(userId),
        status: DietPlanStatus.Active
      })
      .exec();
  }

  findHistoryByUserId(userId: string): Promise<DietPlanDocument[]> {
    return this.dietPlanModel
      .find({
        userId: new Types.ObjectId(userId),
        status: DietPlanStatus.Archived
      })
      .sort({ weekStartDate: -1, createdAt: -1 })
      .exec();
  }

  findByIdAndUserId(id: string, userId: string): Promise<DietPlanDocument | null> {
    return this.dietPlanModel
      .findOne({
        _id: new Types.ObjectId(id),
        userId: new Types.ObjectId(userId)
      })
      .exec();
  }

  async archiveActivePlans(
    userId: string,
    excludedPlanId?: string
  ): Promise<string[]> {
    const filter: Record<string, unknown> = {
      userId: new Types.ObjectId(userId),
      status: DietPlanStatus.Active
    };
    if (excludedPlanId) {
      filter._id = { $ne: new Types.ObjectId(excludedPlanId) };
    }
    const activePlans = await this.dietPlanModel.find(filter).select("_id").exec();
    if (activePlans.length === 0) {
      return [];
    }
    await this.dietPlanModel.updateMany(filter, {
      $set: { status: DietPlanStatus.Archived }
    });
    return activePlans.map((plan) => plan._id.toString());
  }

  save(document: DietPlanDocument): Promise<DietPlanDocument> {
    return document.save();
  }

  replaceMeals(
    document: DietPlanDocument,
    meals: MealEntry[]
  ): Promise<DietPlanDocument> {
    document.meals = meals;
    return document.save();
  }

  deleteMeal(document: DietPlanDocument, mealId: string): Promise<DietPlanDocument> {
    document.meals = document.meals.filter((meal) => meal.mealId !== mealId);
    return document.save();
  }
}
