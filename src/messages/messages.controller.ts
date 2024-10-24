import { Controller, Get, Post, Body, Patch, Param, Delete, Sse, UseGuards, Req, BadRequestException } from '@nestjs/common';
import OpenAI from 'openai';
import { Observable } from 'rxjs';
import * as config from 'config';
import Anthropic from '@anthropic-ai/sdk';

// import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { MessagesService } from './messages.service';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from 'src/user/user.service';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Controller('messages')
export class MessagesController {
  constructor(
    private readonly messagesService: MessagesService,
    private readonly userService: UserService,
  ) {}

  @Post()
  @Sse()
  @UseGuards(AuthGuard('jwt'))
  async create(@Body() createMessageDto: any, @Req() { user }: any): Promise<any> {
    if (!['gpt-3.5-turbo', 'gpt-4o-mini', 'gpt-4', 'gpt-4-turbo', 'gpt-4o'].includes(createMessageDto.model)) {
      console.log('throw');
      throw new BadRequestException('модель не поддерживается');
    }

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

  @Post('image')
  @UseGuards(AuthGuard('jwt'))
  async getImage(@Body() createMessageDto: any, @Req() { user }: any): Promise<any> {
    if (!['dall-e-3'].includes(createMessageDto.model)) {
      console.log('throw');
      throw new BadRequestException('модель не поддерживается');
    }

    const openai = new OpenAI();

    await this.userService.addRequest(user._id).catch(console.log);

    return openai.images.generate(createMessageDto);
  }

  @Post('stability/:model')
  @UseGuards(AuthGuard('jwt'))
  async getStabilityImage(
    @Body() createMessageDto: any,
    @Param('model') model: any,
    @Req() { user }: any,
  ): Promise<any> {
    console.log('model', model);
    createMessageDto = JSON.parse(createMessageDto);

    const formData = new FormData();
    for (let paramsKey in createMessageDto) {
      console.log(paramsKey)
      formData.append(paramsKey, createMessageDto[paramsKey]);
    }

    const res = await fetch(`https://api.stability.ai/v2beta/stable-image/generate/${model}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.get('stabilityKey')}`,
        Accept: 'application/json',
      },
      body: formData,
    });

    return res.json();
  }

  @Post('/claude')
  @Sse()
  @UseGuards(AuthGuard('jwt'))
  async createClaudeMessage(@Body() createMessageDto: any, @Req() { user }: any): Promise<any> {
    console.log('received claude', createMessageDto);
    // if (!['gpt-3.5-turbo', 'gpt-4o-mini', 'gpt-4', 'gpt-4-turbo', 'gpt-4o'].includes(createMessageDto.model)) {
    //   console.log('throw');
    //   throw new BadRequestException('модель не поддерживается');
    // }
    const client = new Anthropic();

    // await this.userService.addRequest(user._id).catch(console.log);

    return new Observable((subscriber) => {
      const stream = client.messages.stream({
        model: createMessageDto.model,
        messages: createMessageDto.messages,
        max_tokens: createMessageDto.max_tokens,
        // stream: true,
      });

      const processStream = async () => {
        for await (const event of stream) {
          subscriber.next({ data: event });
        }

        this.userService.addRequest(user._id);
        subscriber.complete();
      };

      processStream();
    });
  }

  @Post('/google')
  @Sse()
  @UseGuards(AuthGuard('jwt'))
  async createGeminiMessage(@Body() createMessageDto: any, @Req() { user }: any): Promise<any> {
    console.log('received gemini', createMessageDto);
    const apiKey = config.get('geminiKey');
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: createMessageDto.model,
    });

    const chatSession = model.startChat({
      generationConfig: createMessageDto.generationConfig,
      history: createMessageDto.contents,
    });

    const stream = await chatSession.sendMessageStream('');

    return new Observable((subscriber) => {
      const processStream = async () => {
        for await (const event of stream.stream) {
          subscriber.next({ data: event });
        }

        this.userService.addRequest(user._id);
        subscriber.complete();
      };

      processStream();
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

