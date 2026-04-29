import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UnauthorizedException,
  UseGuards
} from "@nestjs/common";

import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CreateWaterLogDto } from "./dto/create-water-log.dto";
import {
  WaterDailySummaryResponseDto,
  WaterLogResponseDto,
  WaterRangeSummaryResponseDto
} from "./dto/water-log-response.dto";
import { WaterLogsService } from "./water-logs.service";

@Controller("water-logs")
@UseGuards(JwtAuthGuard)
export class WaterLogsController {
  constructor(private readonly waterLogsService: WaterLogsService) {}

  @Post()
  createWaterLog(
    @CurrentUser("sub") userId: string | null,
    @Body() payload: CreateWaterLogDto
  ): Promise<WaterLogResponseDto> {
    if (!userId) {
      throw new UnauthorizedException("Missing user context");
    }
    return this.waterLogsService.createWaterLog(userId, payload);
  }

  @Get("daily")
  getDailySummary(
    @CurrentUser("sub") userId: string | null,
    @Query("date") date: string
  ): Promise<WaterDailySummaryResponseDto> {
    if (!userId) {
      throw new UnauthorizedException("Missing user context");
    }
    return this.waterLogsService.getDailySummary(userId, date);
  }

  @Get("range")
  getRangeSummary(
    @CurrentUser("sub") userId: string | null,
    @Query("from") from: string,
    @Query("to") to: string
  ): Promise<WaterRangeSummaryResponseDto> {
    if (!userId) {
      throw new UnauthorizedException("Missing user context");
    }
    return this.waterLogsService.getRangeSummary(userId, from, to);
  }
}
