import Anthropic from '@anthropic-ai/sdk';
import { encoding_for_model, TiktokenModel } from '@dqbd/tiktoken';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Controller, Get, Post, Body, Patch, Param, Delete, Sse, UseGuards, Req, BadRequestException, UseInterceptors } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import * as config from 'config';
import OpenAI from 'openai';
import { Observable } from 'rxjs';

import { UpdateMessageDto } from './dto/update-message.dto';
import { GptInterceptor } from './guards/max-input-length.guard';
import { UserRequestsGuard } from './guards/user-requests.guard';
import { MessagesService } from './messages.service';
import { GlobalService } from '../global/global.service';
import { UserService } from '../user/user.service';

@Controller('messages')
export class MessagesController {
  constructor(
    private readonly messagesService: MessagesService,
    private readonly userService: UserService,
    private readonly globalService: GlobalService,
  ) {}

  @Post()
  @Sse()
  @UseGuards(AuthGuard('jwt'), UserRequestsGuard)
  @UseInterceptors(GptInterceptor)
  async create(@Body() createMessageDto: any, @Req() req: any): Promise<any> {
    const { user, tokenCounts } = req;
    if (!['GPT 4o-mini', 'GPT 4o'].includes(createMessageDto.model)) {
      console.log('throw');
      throw new BadRequestException('модель не поддерживается');
    }

    const openai = new OpenAI({
      apiKey: config.get('openaiKey'),
    });

    let outputTokens = 0;

    let modelName = 'gpt-4o-mini';

    if (createMessageDto.model === 'GPT 4o') {
      modelName = 'gpt-4o';
    }

    return new Observable((subscriber) => {
      openai.chat.completions.create({
        model: modelName,
        messages: createMessageDto.messages,
        stream: true,
      }).then(async (stream) => {
        const enc = encoding_for_model(modelName as TiktokenModel);
        for await (const chunk of stream) {
          const tokens = enc.encode(chunk.choices[0]?.delta?.content || '');
          outputTokens += tokens.length;
          subscriber.next({ data: chunk });
        }

        this.userService.addRequest(user._id);
        this.globalService.addGptTokenCount(tokenCounts, outputTokens);
        subscriber.complete();
      });
    });
  }

  @Post('image')
  @UseGuards(AuthGuard('jwt'), UserRequestsGuard)
  async getImage(@Body() createMessageDto: any, @Req() { user }: any): Promise<any> {
    if (!['DALL-E 3'].includes(createMessageDto.model)) {
      console.log('throw');
      throw new BadRequestException('модель не поддерживается');
    }

    const modelName = 'dall-e-3';

    const openai = new OpenAI({
      apiKey: config.get('openaiKey'),
    });

    await this.userService.addRequest(user._id).catch(console.log);

    return openai.images.generate({
      model: modelName,
      prompt: createMessageDto.prompt,
      size: createMessageDto.size,
    });
  }

  @Post('stability/:model')
  @UseGuards(AuthGuard('jwt'), UserRequestsGuard)
  async getStabilityImage(
    @Body() createMessageDto: any,
    @Param('model') model: any,
    @Req() { user }: any,
  ): Promise<any> {
    console.log('model', model);
    createMessageDto = JSON.parse(createMessageDto);

    const formData = new FormData();
    for (const paramsKey in createMessageDto) {
      console.log(paramsKey);
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
  @UseInterceptors(GptInterceptor)
  @UseGuards(AuthGuard('jwt'), UserRequestsGuard)
  async createClaudeMessage(@Body() createMessageDto: any, @Req() { user, tokenCounts }: any): Promise<any> {
    console.log('received claude', createMessageDto);
    if (!['Claude 3.5 Sonnet'].includes(createMessageDto.model)) {
      console.log('throw');
      throw new BadRequestException('модель не поддерживается');
    }

    const client = new Anthropic();

    const modelName = 'claude-3-5-sonnet-20240620';

    // await this.userService.addRequest(user._id).catch(console.log);

    return new Observable((subscriber) => {
      const stream = client.messages.stream({
        model: modelName,
        messages: createMessageDto.messages,
        max_tokens: createMessageDto.max_tokens,
        // stream: true,
      });

      const processStream = async () => {
        let outputTokens = 0;
        for await (const event of stream) {
          if ((event as any).usage) {
            outputTokens = (event as any).usage?.output_tokens;
          }

          subscriber.next({ data: event });
        }

        this.globalService.addClaudeTokenCount(tokenCounts, outputTokens);
        this.userService.addRequest(user._id);
        console.log('complete');
        subscriber.complete();
      };

      processStream();
    });
  }

  @Post('/google')
  @Sse()
  @UseGuards(AuthGuard('jwt'), UserRequestsGuard)
  async createGeminiMessage(@Body() createMessageDto: any, @Req() { user }: any): Promise<any> {
    console.log('received gemini', createMessageDto);
    const modelName = 'gemini-1.5-pro';
    createMessageDto.model = modelName;
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

