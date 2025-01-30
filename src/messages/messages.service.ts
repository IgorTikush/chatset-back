import { Injectable } from '@nestjs/common';
import * as config from 'config';
import { OpenAI } from 'openai';

import { MessagesRepository } from './messages.repository';
import { Message } from './models/message.model';

@Injectable()
export class MessagesService {
  constructor(private readonly messagesRepository: MessagesRepository) {}

  sendMessageToOpenAi(message: string) {
    return message;
  }

  async translateMessage(message: string) {
    const openai = new OpenAI({
      apiKey: config.get('openaiKey'),
    });

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: 'Return only translation. Translate the following message to English: ' + message }],
      stream: false,
    });

    return response.choices[0].message.content;
  }

  async createMessage(messageData: Partial<Message>): Promise<Message> {
    return this.messagesRepository.create(messageData);
  }
}
