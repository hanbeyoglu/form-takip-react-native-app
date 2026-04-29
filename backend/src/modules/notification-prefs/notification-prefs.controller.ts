import {
  Body,
  Controller,
  Get,
  Patch,
  UnauthorizedException,
  UseGuards
} from "@nestjs/common";

import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { NotificationPreferenceResponseDto } from "./dto/notification-preference-response.dto";
import { UpdateNotificationPreferenceDto } from "./dto/update-notification-preference.dto";
import { NotificationPrefsService } from "./notification-prefs.service";

@Controller("notification-preferences")
@UseGuards(JwtAuthGuard)
export class NotificationPrefsController {
  constructor(
    private readonly notificationPrefsService: NotificationPrefsService
  ) {}

  @Get()
  getPreferences(
    @CurrentUser("sub") userId: string | null
  ): Promise<NotificationPreferenceResponseDto> {
    if (!userId) {
      throw new UnauthorizedException("Missing user context");
    }
    return this.notificationPrefsService.getPreferences(userId);
  }

  @Patch()
  updatePreferences(
    @CurrentUser("sub") userId: string | null,
    @Body() payload: UpdateNotificationPreferenceDto
  ): Promise<NotificationPreferenceResponseDto> {
    if (!userId) {
      throw new UnauthorizedException("Missing user context");
    }
    return this.notificationPrefsService.updatePreferences(userId, payload);
  }
}
