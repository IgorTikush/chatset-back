import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Message } from './models/message.model';

@Injectable()
export class MessagesRepository {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<Message>,
  ) {}

  async create(messageData: Partial<Message>): Promise<Message> {
    const message = new this.messageModel(messageData);

    return message.save();
  }

  async findByChatId(chatId: string): Promise<Message[]> {
    return this.messageModel.find({ chatId }).sort({ createdAt: 1 }).lean();
  }

  async findByUserId(userId: string): Promise<Message[]> {
    return this.messageModel.find({ userId }).sort({ createdAt: -1 }).lean();
  }

  async deleteMany(chatId: string): Promise<void> {
    await this.messageModel.deleteMany({ chatId });
  }
}
