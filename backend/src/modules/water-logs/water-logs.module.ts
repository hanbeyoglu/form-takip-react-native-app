import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { WaterLogsController } from "./water-logs.controller";
import { WaterLogsRepository } from "./repositories/water-logs.repository";
import { WaterLog, WaterLogSchema } from "./schemas/water-log.schema";
import { WaterLogsService } from "./water-logs.service";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: WaterLog.name, schema: WaterLogSchema }])
  ],
  controllers: [WaterLogsController],
  providers: [WaterLogsService, WaterLogsRepository],
  exports: [WaterLogsService]
})
export class WaterLogsModule {}
