import { BadRequestException, Injectable } from "@nestjs/common";
import { Types } from "mongoose";

import {
  assertValidDateInput,
  toUtcDayEnd,
  toUtcDayStart
} from "../../common/utils/date-range.util";
import { CreateWeightLogDto } from "./dto/create-weight-log.dto";
import { WeightLogResponseDto } from "./dto/weight-log-response.dto";
import { WeightLogsRepository } from "./repositories/weight-logs.repository";
import { WeightLogDocument } from "./schemas/weight-log.schema";

@Injectable()
export class WeightLogsService {
  constructor(private readonly repository: WeightLogsRepository) {}

  async createWeightLog(
    userId: string,
    payload: CreateWeightLogDto
  ): Promise<WeightLogResponseDto> {
    assertValidDateInput(payload.loggedAt);
    const created = await this.repository.create({
      userId: new Types.ObjectId(userId),
      weightKg: payload.weightKg,
      loggedAt: new Date(payload.loggedAt),
      note: payload.note?.trim()
    });
    return this.toResponse(created);
  }

  async getWeightLogs(
    userId: string,
    from: string,
    to: string
  ): Promise<WeightLogResponseDto[]> {
    if (!from || !to) {
      throw new BadRequestException("from and to query params are required");
    }
    const start = toUtcDayStart(from);
    const end = toUtcDayEnd(to);
    if (end.getTime() < start.getTime()) {
      throw new BadRequestException("to must be greater or equal from");
    }
    const logs = await this.repository.findByUserAndDateRange(userId, start, end);
    return logs.map((log) => this.toResponse(log));
  }

  async getLatestWeight(userId: string): Promise<WeightLogResponseDto | null> {
    const latest = await this.repository.findLatestByUser(userId);
    return latest ? this.toResponse(latest) : null;
  }

  private toResponse(log: WeightLogDocument): WeightLogResponseDto {
    return {
      id: log.id,
      userId: log.userId.toString(),
      weightKg: log.weightKg,
      loggedAt: log.loggedAt.toISOString(),
      note: log.note,
      createdAt: log.createdAt.toISOString(),
      updatedAt: log.updatedAt.toISOString()
    };
  }

}
