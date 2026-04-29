import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";

import configuration from "./config/configuration";
import { validateEnv } from "./common/utils/env.validation";
import { AuthModule } from "./modules/auth/auth.module";
import { DietPlansModule } from "./modules/diet-plans/diet-plans.module";
import { NotificationPrefsModule } from "./modules/notification-prefs/notification-prefs.module";
import { StatsModule } from "./modules/stats/stats.module";
import { UsersModule } from "./modules/users/users.module";
import { WaterLogsModule } from "./modules/water-logs/water-logs.module";
import { WeightLogsModule } from "./modules/weight-logs/weight-logs.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate: validateEnv
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>("mongoUri")
      })
    }),
    AuthModule,
    UsersModule,
    DietPlansModule,
    WaterLogsModule,
    WeightLogsModule,
    StatsModule,
    NotificationPrefsModule
  ]
})
export class AppModule {}
