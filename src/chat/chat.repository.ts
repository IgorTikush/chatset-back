import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Chat } from './models/chat.model';

@Injectable()
export class ChatRepository {
  constructor(@InjectModel(Chat.name) private chatModel: Model<Chat>) {}

  async create(chatData: Partial<Chat>): Promise<Chat> {
    const chat = new this.chatModel(chatData);

    return chat.save();
  }

  async findByUserId(userId: string): Promise<Chat[]> {
    return this.chatModel.find({ userId }).sort({ createdAt: -1 }).lean();
  }

  async findById(chatId: string): Promise<Chat> {
    return this.chatModel.findById(chatId).lean();
  }

  async update(chatId: string, updateData: Partial<Chat>): Promise<Chat> {
    return this.chatModel.findByIdAndUpdate(chatId, updateData, { new: true });
  }

  async delete(chatId: string, userId: string): Promise<void> {
    await this.chatModel.findOneAndDelete({ _id: chatId, userId });
  }
}
