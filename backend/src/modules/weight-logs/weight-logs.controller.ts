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
import { CreateWeightLogDto } from "./dto/create-weight-log.dto";
import { WeightLogResponseDto } from "./dto/weight-log-response.dto";
import { WeightLogsService } from "./weight-logs.service";

@Controller("weight-logs")
@UseGuards(JwtAuthGuard)
export class WeightLogsController {
  constructor(private readonly weightLogsService: WeightLogsService) {}

  @Post()
  createWeightLog(
    @CurrentUser("sub") userId: string | null,
    @Body() payload: CreateWeightLogDto
  ): Promise<WeightLogResponseDto> {
    if (!userId) {
      throw new UnauthorizedException("Missing user context");
    }
    return this.weightLogsService.createWeightLog(userId, payload);
  }

  @Get()
  getWeightLogs(
    @CurrentUser("sub") userId: string | null,
    @Query("from") from: string,
    @Query("to") to: string
  ): Promise<WeightLogResponseDto[]> {
    if (!userId) {
      throw new UnauthorizedException("Missing user context");
    }
    return this.weightLogsService.getWeightLogs(userId, from, to);
  }
}
