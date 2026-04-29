import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";

import { WeightLog, WeightLogDocument } from "../schemas/weight-log.schema";

@Injectable()
export class WeightLogsRepository {
  constructor(
    @InjectModel(WeightLog.name)
    private readonly model: Model<WeightLogDocument>
  ) {}

  create(payload: Partial<WeightLog>): Promise<WeightLogDocument> {
    const created = new this.model(payload);
    return created.save();
  }

  findByUserAndDateRange(
    userId: string,
    from: Date,
    to: Date
  ): Promise<WeightLogDocument[]> {
    return this.model
      .find({
        userId: new Types.ObjectId(userId),
        loggedAt: { $gte: from, $lte: to }
      })
      .sort({ loggedAt: -1 })
      .exec();
  }

  findLatestByUser(userId: string): Promise<WeightLogDocument | null> {
    return this.model
      .findOne({ userId: new Types.ObjectId(userId) })
      .sort({ loggedAt: -1, createdAt: -1 })
      .exec();
  }
}
