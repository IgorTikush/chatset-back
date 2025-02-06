import Anthropic from '@anthropic-ai/sdk';
import { encoding_for_model, TiktokenModel } from '@dqbd/tiktoken';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Controller, Post, Body, Param, Sse, UseGuards, Req, BadRequestException, UseInterceptors } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import * as Sentry from '@sentry/node';
import * as config from 'config';
import OpenAI from 'openai';
import { Observable } from 'rxjs';

import { GptInterceptor } from './guards/max-input-length.guard';
import { PaymentAndLimitsGuard } from './guards/payments-and-limits.guard';
import { MessagesService } from './messages.service';
import { SDGenerationValidation, SDModelValidation } from './validations/stable-diffusion.validations';
import { GlobalService } from '../global/global.service';
import { LimitService } from '../limit/limit.service';
import { UserService } from '../user/user.service';

@Controller('messages')
export class MessagesController {
  constructor(
    private readonly messagesService: MessagesService,
    private readonly userService: UserService,
    private readonly globalService: GlobalService,
    private readonly limitService: LimitService,
  ) {}

  @Post()
  @Sse()
  @UseGuards(AuthGuard('jwt'), PaymentAndLimitsGuard)
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

    this.messagesService.createMessage({
      userId: user._id,
      role: 'user',
      content: createMessageDto.messages[createMessageDto.messages.length - 1].content,
      model: modelName,
    }).catch((error) => {
      Sentry.captureException(error);
    });

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
        if (modelName !== 'gpt-4o-mini') {
          this.limitService.addUsedTokens({ inputTokens: tokenCounts, outputTokens, userId: user._id, model: modelName });
        }

        subscriber.complete();
      });
    });
  }

  @Post('openai/no-stream')
  @UseGuards(AuthGuard('jwt'), PaymentAndLimitsGuard)
  @UseInterceptors(GptInterceptor)
  async createNoStream(@Body() createMessageDto: any, @Req() req: any): Promise<any> {
    const { user, tokenCounts } = req;
    if (!['GPT 4o-mini', 'GPT 4o'].includes(createMessageDto.model)) {
      console.log('throw');
      throw new BadRequestException('модель не поддерживается');
    }

    const openai = new OpenAI({
      apiKey: config.get('openaiKey'),
    });

    const outputTokens = 0;

    let modelName = 'gpt-4o-mini';

    if (createMessageDto.model === 'GPT 4o') {
      modelName = 'gpt-4o';
    }

    // this.messagesService.createMessage({
    //   userId: user._id,
    //   role: 'user',
    //   content: createMessageDto.messages[createMessageDto.messages.length - 1].content,
    //   model: modelName,
    // }).catch(console.log);

    return openai.chat.completions.create({
      model: modelName,
      messages: createMessageDto.messages,
      stream: false,
    });

    // return new Observable((subscriber) => {
    //   openai.chat.completions.create({
    //     model: modelName,
    //     messages: createMessageDto.messages,
    //     stream: true,
    //   }).then(async (stream) => {
    //     const enc = encoding_for_model(modelName as TiktokenModel);
    //     for await (const chunk of stream) {
    //       const tokens = enc.encode(chunk.choices[0]?.delta?.content || '');
    //       outputTokens += tokens.length;
    //       subscriber.next({ data: chunk });
    //     }

    //     this.userService.addRequest(user._id);
    //     if (modelName !== 'gpt-4o-mini') {
    //       this.limitService.addUsedTokens({ inputTokens: tokenCounts, outputTokens, userId: user._id, model: modelName });
    //     }

    //     subscriber.complete();
    //   });
    // });
  }

  @Post('image')
  @UseGuards(AuthGuard('jwt'), PaymentAndLimitsGuard)
  async getImage(@Body() createMessageDto: any, @Req() { user }: any): Promise<any> {
    console.log('createMessageDto', createMessageDto);
    if (!['DALL-E 3'].includes(createMessageDto.model)) {
      console.log('throw');
      throw new BadRequestException('модель не поддерживается');
    }

    const modelName = 'dall-e-3';

    this.messagesService.createMessage({
      userId: user._id,
      role: 'user',
      content: createMessageDto.messages[createMessageDto.messages.length - 1].content,
      model: modelName,
    }).catch((error) => {
      Sentry.captureException(error);
    });

    const openai = new OpenAI({
      apiKey: config.get('openaiKey'),
    });

    await this.userService.addRequest(user._id).catch(console.log);

    return openai.images.generate({
      model: modelName,
      prompt: createMessageDto.prompt,
      size: createMessageDto.size,
    }).then(res => {
      this.limitService.addUsedTokensForImage(user._id, createMessageDto.size, createMessageDto.quality);

      return res;
    });
  }

  @Post('stability/:model')
  @UseGuards(AuthGuard('jwt'), PaymentAndLimitsGuard)
  async getStabilityImage(
    @Body() createMessageDto: SDGenerationValidation,
    @Param() { model }: SDModelValidation,
    @Req() { user }: any,
  ): Promise<any> {
    const translatedMessage = await this.messagesService.translateMessage(createMessageDto.prompt);
    const formData = new FormData();
    for (const paramsKey in createMessageDto) {
      console.log(paramsKey);
      if (paramsKey === 'prompt') {
        formData.append(paramsKey, translatedMessage);
        continue;
      }

      formData.append(paramsKey, createMessageDto[paramsKey]);
    }

    this.messagesService.createMessage({
      userId: user._id,
      role: 'user',
      content: translatedMessage,
      model: createMessageDto.model,
    }).catch((error) => {
      Sentry.captureException(error);
    });

    const res = await fetch(`https://api.stability.ai/v2beta/stable-image/generate/${model}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.get('stabilityKey')}`,
        Accept: 'application/json',
      },
      body: formData,
    });

    const resJson = await res.json();
    this.limitService.addUsedTokensForStableDiffusion(user._id, createMessageDto.model || model);

    return resJson;
  }

  @Post('/claude')
  @Sse()
  @UseGuards(AuthGuard('jwt'), PaymentAndLimitsGuard)
  async createClaudeMessage(@Body() createMessageDto: any, @Req() { user }: any): Promise<any> {
    console.log('received claude', createMessageDto);
    if (!['Claude 3.5 Sonnet'].includes(createMessageDto.model)) {
      console.log('throw');
      throw new BadRequestException('модель не поддерживается');
    }

    const client = new Anthropic({
      apiKey: config.get('claudeKey'),
    });

    const modelName = 'claude-3-5-sonnet-20240620';

    this.messagesService.createMessage({
      userId: user._id,
      role: 'user',
      content: createMessageDto.messages[createMessageDto.messages.length - 1].content,
      model: createMessageDto.model,
    }).catch((error) => {
      Sentry.captureException(error);
    });

    return new Observable((subscriber) => {
      const stream = client.messages.stream({
        model: modelName,
        messages: createMessageDto.messages,
        max_tokens: createMessageDto.max_tokens,
        stream: true,
      });

      const processStream = async () => {
        let outputTokens = 0;
        let inputTokens = 0;
        for await (const event of stream) {
          console.log('event', event);
          if ((event as any).usage) {
            outputTokens = (event as any).usage?.output_tokens;
          }

          if (event.type === 'message_start') {
            inputTokens = event.message.usage.input_tokens;
          }

          subscriber.next({ data: event });
        }

        this.limitService.addUsedTokens({ inputTokens, outputTokens, userId: user._id, model: modelName });
        this.userService.addRequest(user._id);
        subscriber.complete();
      };

      processStream();
    });
  }

  @Post('/google')
  @Sse()
  @UseGuards(AuthGuard('jwt'), PaymentAndLimitsGuard)
  async createGeminiMessage(@Body() createMessageDto: any, @Req() { user }: any): Promise<any> {
    console.log('received gemini', createMessageDto);
    const modelName = 'gemini-1.5-pro';
    createMessageDto.model = modelName;
    const apiKey = config.get('geminiKey');
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: createMessageDto.model,
    });

    this.messagesService.createMessage({
      userId: user._id,
      role: 'user',
      content: createMessageDto.contents[createMessageDto.contents.length - 1],
      model: createMessageDto.model,
    }).catch((error) => {
      Sentry.captureException(error);
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
}

