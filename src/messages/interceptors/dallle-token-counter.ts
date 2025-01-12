import { CallHandler, ExecutionContext, ForbiddenException, NestInterceptor } from '@nestjs/common';
import { encode } from 'gpt-tokenizer';
import { Observable } from 'rxjs';

export class DalleTokenCounter implements NestInterceptor {
  intercept(context: ExecutionContext, handler: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { body, user } = request;

    let tokenCounts = 0;

    body.messages = body.messages.map(message => {
      if (message.role === 'assistant') {
        message.content = '';

        return message;
      }

      if (Array.isArray(message.content)) {
        message.content.forEach(content => {
          if (typeof content === 'string') {
            tokenCounts += encode(content).length;
          } else if (content.type === 'image_url') {
            tokenCounts += 1600;
          }
        });
      } else {
        tokenCounts += encode(message.content).length;
      }

      return message;
    }).filter(message => message.content?.length > 0);

    request.tokenCounts = tokenCounts;
    console.log('tokenCounts', tokenCounts);

    return handler.handle();
  }
}
