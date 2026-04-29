import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { DietPlansController } from "./diet-plans.controller";
import { DietPlansRepository } from "./repositories/diet-plans.repository";
import { DietPlan, DietPlanSchema } from "./schemas/diet-plan.schema";
import { DietPlansService } from "./diet-plans.service";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: DietPlan.name, schema: DietPlanSchema }])
  ],
  controllers: [DietPlansController],
  providers: [DietPlansService, DietPlansRepository]
})
export class DietPlansModule {}
