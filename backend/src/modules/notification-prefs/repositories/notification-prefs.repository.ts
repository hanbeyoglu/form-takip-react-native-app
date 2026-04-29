import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";

import {
  NotificationPreference,
  NotificationPreferenceDocument
} from "../schemas/notification-preference.schema";

@Injectable()
export class NotificationPrefsRepository {
  constructor(
    @InjectModel(NotificationPreference.name)
    private readonly model: Model<NotificationPreferenceDocument>
  ) {}

  findByUserId(userId: string): Promise<NotificationPreferenceDocument | null> {
    return this.model.findOne({ userId: new Types.ObjectId(userId) }).exec();
  }

  createDefault(userId: string): Promise<NotificationPreferenceDocument> {
    const created = new this.model({
      userId: new Types.ObjectId(userId)
    });
    return created.save();
  }

  save(
    document: NotificationPreferenceDocument
  ): Promise<NotificationPreferenceDocument> {
    return document.save();
  }
}
