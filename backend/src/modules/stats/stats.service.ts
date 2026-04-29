import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";

import { toUtcDayEnd, toUtcDayStart } from "../../common/utils/date-range.util";
import { User, UserDocument } from "../users/schemas/user.schema";
import {
  DietPlan,
  DietPlanDocument,
  DietPlanStatus
} from "../diet-plans/schemas/diet-plan.schema";
import { mealAppliesOnDate } from "../diet-plans/utils/meal-applicability.util";
import { WaterLog, WaterLogDocument } from "../water-logs/schemas/water-log.schema";
import { WeightLog, WeightLogDocument } from "../weight-logs/schemas/weight-log.schema";
import { DashboardStatsResponseDto } from "./dto/dashboard-stats-response.dto";
import { BasicStatsResponseDto } from "./dto/basic-stats-response.dto";

@Injectable()
export class StatsService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(DietPlan.name) private readonly dietPlanModel: Model<DietPlanDocument>,
    @InjectModel(WaterLog.name) private readonly waterLogModel: Model<WaterLogDocument>,
    @InjectModel(WeightLog.name) private readonly weightLogModel: Model<WeightLogDocument>
  ) {}

  async getDashboardStats(userId: string): Promise<DashboardStatsResponseDto> {
    const userObjectId = new Types.ObjectId(userId);
    const todayDate = new Date().toISOString().slice(0, 10);
    const todayStart = toUtcDayStart(todayDate);
    const todayEnd = toUtcDayEnd(todayDate);

    const [user, activePlan, todayWaterLogs, latestWeight] = await Promise.all([
      this.userModel.findById(userObjectId).exec(),
      this.dietPlanModel
        .findOne({ userId: userObjectId, status: DietPlanStatus.Active })
        .exec(),
      this.waterLogModel
        .find({ userId: userObjectId, loggedAt: { $gte: todayStart, $lte: todayEnd } })
        .exec(),
      this.weightLogModel
        .findOne({ userId: userObjectId })
        .sort({ loggedAt: -1, createdAt: -1 })
        .exec()
    ]);

    const todayWaterConsumedMl = todayWaterLogs.reduce(
      (sum, log) => sum + log.amountMl,
      0
    );
    const dailyWaterTargetMl = Math.max(1, user?.dailyWaterTargetMl ?? 2500);

    return {
      activePlan: activePlan
        ? {
            id: activePlan.id,
            title: activePlan.title,
            weekStartDate: activePlan.weekStartDate.toISOString().slice(0, 10),
            weekEndDate: activePlan.weekEndDate.toISOString().slice(0, 10),
            status: activePlan.status
          }
        : null,
      todayMealCount:
        activePlan?.meals.filter((meal) => mealAppliesOnDate(meal, todayDate)).length ?? 0,
      dailyWaterTargetMl,
      todayWaterConsumedMl,
      latestWeight: latestWeight
        ? {
            weightKg: latestWeight.weightKg,
            loggedAt: latestWeight.loggedAt.toISOString()
          }
        : null,
      waterProgressPercent: Math.min(
        100,
        Math.round((todayWaterConsumedMl / dailyWaterTargetMl) * 100)
      )
    };
  }

  async getBasicStats(
    userId: string,
    range: "7d" | "30d"
  ): Promise<BasicStatsResponseDto> {
    if (!["7d", "30d"].includes(range)) {
      throw new BadRequestException("range must be 7d or 30d");
    }
    const days = range === "7d" ? 7 : 30;
    const end = toUtcDayEnd(new Date().toISOString().slice(0, 10));
    const start = new Date(end);
    start.setUTCDate(start.getUTCDate() - (days - 1));
    start.setUTCHours(0, 0, 0, 0);

    const userObjectId = new Types.ObjectId(userId);
    const [waterLogs, weightLogs, user] = await Promise.all([
      this.waterLogModel
        .find({ userId: userObjectId, loggedAt: { $gte: start, $lte: end } })
        .exec(),
      this.weightLogModel
        .find({ userId: userObjectId, loggedAt: { $gte: start, $lte: end } })
        .sort({ loggedAt: 1, createdAt: 1 })
        .exec(),
      this.userModel.findById(userObjectId).exec()
    ]);

    const totalWaterMl = waterLogs.reduce((sum, log) => sum + log.amountMl, 0);
    const groupedWater = new Map<string, number>();
    for (const log of waterLogs) {
      const key = log.loggedAt.toISOString().slice(0, 10);
      groupedWater.set(key, (groupedWater.get(key) ?? 0) + log.amountMl);
    }
    const waterGoalTarget = user?.dailyWaterTargetMl ?? 2500;
    const waterGoalHitDays = Array.from(groupedWater.values()).filter(
      (value) => value >= waterGoalTarget
    ).length;

    const firstWeightInRange = weightLogs.length > 0 ? weightLogs[0].weightKg : null;
    const latestWeightInRange =
      weightLogs.length > 0 ? weightLogs[weightLogs.length - 1].weightKg : null;
    const weightChangeInRange =
      firstWeightInRange !== null && latestWeightInRange !== null
        ? Number((latestWeightInRange - firstWeightInRange).toFixed(2))
        : null;

    return {
      range,
      from: start.toISOString().slice(0, 10),
      to: end.toISOString().slice(0, 10),
      totalWaterLogs: waterLogs.length,
      averageDailyWaterMl: Math.round(totalWaterMl / days),
      waterGoalHitDays,
      firstWeightInRange,
      latestWeightInRange,
      weightChangeInRange
    };
  }

}
