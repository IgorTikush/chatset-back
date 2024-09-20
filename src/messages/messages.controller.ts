import { Readable } from 'stream';

import { Controller, Get, Post, Body, Patch, Param, Delete, Res, Req, Sse } from '@nestjs/common';
import OpenAI from 'openai';
import { interval, map, Observable } from 'rxjs';

import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { MessagesService } from './messages.service';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  @Sse()
  async create(@Body() createMessageDto: any): Promise<any> {
    console.log(createMessageDto);
    const openai = new OpenAI();

    // Set headers for SSE
    // res.raw.setHeader('Content-Type', 'text/event-stream');
    // res.raw.setHeader('Cache-Control', 'no-cache');
    // res.raw.setHeader('Connection', 'keep-alive');

    // // Emit SSE messages every 2 seconds
    // const messageStream = interval(2000).pipe(
    //   map((count) => {
    //     res.raw.write(`data: POST SSE message #${count}\n\n`);
    //   }),
    // );

    // // Start emitting messages
    // const subscription = messageStream.subscribe();
    // setTimeout(() => res.raw.end(), 1000);

    // Close the stream when the client disconnects
    // req.raw.on('close', () => {
    //   subscription.unsubscribe();
    //   res.raw.end(); // End the connection
    // });

    // const res = await fetch('https://geo.myip.link').catch(console.log);
    // if (res) {
    //   console.log(await res?.text());
    // }

    // return interval(500).pipe(
    //   map((count) => ({
    //     data: { message: `SSE message #${count}` },
    //   })),
    // );
    // console.log(res);
    // res.writeHead('some');
    return new Observable((subscriber) => {
      openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: createMessageDto.messages,
        stream: true,
      }).then(async (stream) => {
        for await (const chunk of stream) {
          subscriber.next({ data: chunk });
          console.log(chunk.choices[0]?.delta?.content);
        }

        subscriber.complete();
      });
    });

    // res.status(200).send('OK');
    // console.log(stream);
    // console.log(completion.choices[0].message.content);

    // return completion.choices[0].message.content;
    // response.raw.setHeader('content-type', 'text/plain');
    // stream.data.on('data', (chunk) => {
    //   const parsedChunk = chunk.toString();
    //   console.log(parsedChunk);  // Convert buffer to string
    //   res.write(`data: ${parsedChunk}\n\n`); // Send chunk via SSE
    // });
    // res.status(200).send('OK');

    return 'stream';

    // return this.messagesService.create(createMessageDto);
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
