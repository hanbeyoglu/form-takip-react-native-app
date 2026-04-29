import { BadRequestException, Injectable } from "@nestjs/common";
import { Types } from "mongoose";

import {
  assertValidDateInput,
  normalizeDayString,
  toUtcDayEnd,
  toUtcDayStart
} from "../../common/utils/date-range.util";
import { CreateWaterLogDto } from "./dto/create-water-log.dto";
import {
  WaterDailySummaryResponseDto,
  WaterLogResponseDto,
  WaterRangeSummaryResponseDto
} from "./dto/water-log-response.dto";
import { WaterLogsRepository } from "./repositories/water-logs.repository";
import { WaterLogDocument } from "./schemas/water-log.schema";

@Injectable()
export class WaterLogsService {
  constructor(private readonly repository: WaterLogsRepository) {}

  async createWaterLog(
    userId: string,
    payload: CreateWaterLogDto
  ): Promise<WaterLogResponseDto> {
    assertValidDateInput(payload.loggedAt);
    const created = await this.repository.create({
      userId: new Types.ObjectId(userId),
      amountMl: payload.amountMl,
      loggedAt: new Date(payload.loggedAt),
      source: payload.source
    });
    return this.toResponse(created);
  }

  async getDailySummary(
    userId: string,
    dateString: string
  ): Promise<WaterDailySummaryResponseDto> {
    if (!dateString) {
      throw new BadRequestException("date query param is required");
    }
    const dayStart = toUtcDayStart(dateString);
    const dayEnd = toUtcDayEnd(dateString);
    const logs = await this.repository.findByUserAndDateRange(userId, dayStart, dayEnd);
    const totalConsumedMl = logs.reduce((sum, log) => sum + log.amountMl, 0);
    return {
      date: normalizeDayString(dateString),
      totalConsumedMl,
      logCount: logs.length,
      logs: logs.map((log) => this.toResponse(log))
    };
  }

  async getRangeSummary(
    userId: string,
    from: string,
    to: string
  ): Promise<WaterRangeSummaryResponseDto> {
    if (!from || !to) {
      throw new BadRequestException("from and to query params are required");
    }
    const start = toUtcDayStart(from);
    const end = toUtcDayEnd(to);
    if (end.getTime() < start.getTime()) {
      throw new BadRequestException("to must be greater or equal from");
    }
    const logs = await this.repository.findByUserAndDateRange(userId, start, end);
    const grouped = new Map<string, number>();
    for (const log of logs) {
      const key = log.loggedAt.toISOString().slice(0, 10);
      grouped.set(key, (grouped.get(key) ?? 0) + log.amountMl);
    }
    const dailyTotals = Array.from(grouped.entries())
      .map(([date, totalConsumedMl]) => ({ date, totalConsumedMl }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      from: normalizeDayString(from),
      to: normalizeDayString(to),
      totalConsumedMl: logs.reduce((sum, log) => sum + log.amountMl, 0),
      logCount: logs.length,
      dailyTotals
    };
  }

  private toResponse(log: WaterLogDocument): WaterLogResponseDto {
    return {
      id: log.id,
      userId: log.userId.toString(),
      amountMl: log.amountMl,
      loggedAt: log.loggedAt.toISOString(),
      source: log.source,
      createdAt: log.createdAt.toISOString(),
      updatedAt: log.updatedAt.toISOString()
    };
  }

}
