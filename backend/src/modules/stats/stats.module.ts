import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { DietPlan, DietPlanSchema } from "../diet-plans/schemas/diet-plan.schema";
import { User, UserSchema } from "../users/schemas/user.schema";
import { WaterLog, WaterLogSchema } from "../water-logs/schemas/water-log.schema";
import { WeightLog, WeightLogSchema } from "../weight-logs/schemas/weight-log.schema";
import { StatsController } from "./stats.controller";
import { StatsService } from "./stats.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: DietPlan.name, schema: DietPlanSchema },
      { name: WaterLog.name, schema: WaterLogSchema },
      { name: WeightLog.name, schema: WeightLogSchema }
    ])
  ],
  controllers: [StatsController],
  providers: [StatsService]
})
export class StatsModule {}
