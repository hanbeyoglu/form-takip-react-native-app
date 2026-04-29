import {
  Controller,
  Get,
  Query,
  UnauthorizedException,
  UseGuards
} from "@nestjs/common";

import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { BasicStatsResponseDto } from "./dto/basic-stats-response.dto";
import { DashboardStatsResponseDto } from "./dto/dashboard-stats-response.dto";
import { StatsService } from "./stats.service";

@Controller("stats")
@UseGuards(JwtAuthGuard)
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get("dashboard")
  getDashboard(
    @CurrentUser("sub") userId: string | null
  ): Promise<DashboardStatsResponseDto> {
    if (!userId) {
      throw new UnauthorizedException("Missing user context");
    }
    return this.statsService.getDashboardStats(userId);
  }

  @Get("basic")
  getBasicStats(
    @CurrentUser("sub") userId: string | null,
    @Query("range") range: "7d" | "30d"
  ): Promise<BasicStatsResponseDto> {
    if (!userId) {
      throw new UnauthorizedException("Missing user context");
    }
    return this.statsService.getBasicStats(userId, range);
  }
}
