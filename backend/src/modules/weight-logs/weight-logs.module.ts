import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { WeightLogsController } from "./weight-logs.controller";
import { WeightLogsRepository } from "./repositories/weight-logs.repository";
import { WeightLog, WeightLogSchema } from "./schemas/weight-log.schema";
import { WeightLogsService } from "./weight-logs.service";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: WeightLog.name, schema: WeightLogSchema }])
  ],
  controllers: [WeightLogsController],
  providers: [WeightLogsService, WeightLogsRepository],
  exports: [WeightLogsService]
})
export class WeightLogsModule {}
