import { Controller, Get, Post, Body, Patch, Param, Delete, Sse, UseGuards, Req, BadRequestException } from '@nestjs/common';
import OpenAI from 'openai';
import { Observable } from 'rxjs';

// import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { MessagesService } from './messages.service';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from 'src/user/user.service';

@Controller('messages')
export class MessagesController {
  constructor(
    private readonly messagesService: MessagesService,
    private readonly userService: UserService,
  ) {}

  @Post()
  @Sse()
  // @UseGuards(AuthGuard('jwt'))
  async create(@Body() createMessageDto: any, @Req() { user }: any): Promise<any> {
    console.log(createMessageDto);
    if (!['gpt-3.5-turbo', 'gpt-4o-mini', 'gpt-4', 'gpt-4-turbo', 'gpt-4o'].includes(createMessageDto.model)) {
      console.log('throw');
      throw new BadRequestException('модель не поддерживается');
    }

    await this.userService.addRequest(user._id);
    const openai = new OpenAI();

    return new Observable((subscriber) => {
      openai.chat.completions.create({
        model: createMessageDto.model,
        messages: createMessageDto.messages,
        stream: true,
      }).then(async (stream) => {
        for await (const chunk of stream) {
          subscriber.next({ data: chunk });
          console.log(chunk.choices[0]?.delta?.content);
        }

        this.userService.addRequest(user._id);
        subscriber.complete();
      });
    });
  }

  @Get()
  findAll() {
    return this.messagesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.messagesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMessageDto: UpdateMessageDto) {
    return this.messagesService.update(+id, updateMessageDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.messagesService.remove(+id);
  }
}

