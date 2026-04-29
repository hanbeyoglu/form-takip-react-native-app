import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { NotificationPrefsController } from "./notification-prefs.controller";
import { NotificationPrefsRepository } from "./repositories/notification-prefs.repository";
import { NotificationPrefsService } from "./notification-prefs.service";
import {
  NotificationPreference,
  NotificationPreferenceSchema
} from "./schemas/notification-preference.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: NotificationPreference.name,
        schema: NotificationPreferenceSchema
      }
    ])
  ],
  controllers: [NotificationPrefsController],
  providers: [NotificationPrefsService, NotificationPrefsRepository]
})
export class NotificationPrefsModule {}
