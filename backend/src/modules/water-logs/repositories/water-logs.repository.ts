import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";

import { WaterLog, WaterLogDocument } from "../schemas/water-log.schema";

@Injectable()
export class WaterLogsRepository {
  constructor(
    @InjectModel(WaterLog.name)
    private readonly model: Model<WaterLogDocument>
  ) {}

  create(payload: Partial<WaterLog>): Promise<WaterLogDocument> {
    const created = new this.model(payload);
    return created.save();
  }

  findByUserAndDateRange(
    userId: string,
    from: Date,
    to: Date
  ): Promise<WaterLogDocument[]> {
    return this.model
      .find({
        userId: new Types.ObjectId(userId),
        loggedAt: { $gte: from, $lte: to }
      })
      .sort({ loggedAt: -1 })
      .exec();
  }
}
