import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Limit } from './models/limit.model';

@Injectable()
export class LimitRepository {
  constructor(@InjectModel(Limit.name) private limitModel: Model<Limit>) {}

  async create(userId: string, limitParams: { tokens: number; expiresIn: Date; planName: string }): Promise<Limit> {
    const newLimit = new this.limitModel({
      userId,
      availableTokens: limitParams.tokens,
      usedTokens: 0,
      expiredAt: limitParams.expiresIn,
      planName: limitParams.planName,
    });

    return newLimit.save();
  }

  async findCurrentByUserId(userId: string): Promise<Limit | null> {
    return this.limitModel.findOne({ userId, expiredAt: { $gte: new Date() } }).lean();
  }

  async updateByUserId(userId: string, maxLimit: number): Promise<Limit | null> {
    return this.limitModel.findOneAndUpdate(
      { userId },
      { maxLimit },
      { new: true },
    );
  }

  async addUsedTokens(chatsetTokens: number, userId: string): Promise<Limit | null> {
    return this.limitModel.findOneAndUpdate(
      { userId },
      { $inc: { usedTokens: chatsetTokens } },
    );
  }

  async cancelSubscription(userId: string): Promise<void> {
    await this.limitModel.findOneAndUpdate(
      { userId },
      { $set: { canceled: true } },
      { sort: { createdAt: -1 } },
    );
  }
}
