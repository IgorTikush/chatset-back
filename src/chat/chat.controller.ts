import { Controller, Post, Body, UseGuards, Req, Delete, Param } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { ChatService } from './chat.service';
import { Chat } from './models/chat.model';
import { CreateChatValidation } from './validations/create-chat.validation';

@Controller('chats')
@UseGuards(AuthGuard('jwt'))
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  async createChat(
    @Req() { user },
    @Body() createChatDto: CreateChatValidation,
  ): Promise<{ chatId: string }> {
    const chat = await this.chatService.createChat(user._id, createChatDto.model);
    console.log(chat);

    return { chatId: chat._id.toString() };
  }

  // @Get()
  // async getUserChats(@Req() { user }): Promise<Chat[]> {
  //   return this.chatService.getUserChats(user._id);
  // }

  // @Get(':id')
  // async getChat(@Param('id') id: string): Promise<Chat> {
  //   return this.chatService.getChat(id);
  // }

  // @Put(':id')
  // async updateChat(
  //   @Param('id') id: string,
  //   @Body() updateChatDto: { messages: any[] },
  // ): Promise<Chat> {
  //   return this.chatService.updateChat(id, updateChatDto.messages);
  // }

  @Delete(':id')
  async deleteChat(
    @Req() { user },
    @Param('id') id: string,
  ): Promise<void> {
    await this.chatService.deleteChat(id, user._id);
  }
}
