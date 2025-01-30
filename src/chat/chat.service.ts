import { Injectable, NotFoundException } from '@nestjs/common';

import { ChatRepository } from './chat.repository';
import { Chat } from './models/chat.model';

@Injectable()
export class ChatService {
  constructor(private readonly chatRepository: ChatRepository) {}

  async createChat(userId: string, model: string): Promise<Chat> {
    return this.chatRepository.create({
      userId,
      title: 'Новый чат',
      model,
    });
  }

  // async getUserChats(userId: string): Promise<Chat[]> {
  //   return this.chatRepository.findByUserId(userId);
  // }

  // async getChat(chatId: string): Promise<Chat> {
  //   const chat = await this.chatRepository.findById(chatId);
  //   if (!chat) {
  //     throw new NotFoundException('Chat not found');
  //   }

  //   return chat;
  // }

  // async updateChat(chatId: string, messages: any[]): Promise<Chat> {
  //   const chat = await this.chatRepository.findById(chatId);
  //   if (!chat) {
  //     throw new NotFoundException('Chat not found');
  //   }

  //   return this.chatRepository.update(chatId, { messages });
  // }

  async deleteChat(chatId: string, userId: string): Promise<void> {
    await this.chatRepository.delete(chatId, userId);
  }
}
