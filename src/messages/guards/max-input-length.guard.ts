import { CallHandler, ExecutionContext, ForbiddenException, NestInterceptor } from '@nestjs/common';
import { encode } from 'gpt-tokenizer';
import { Observable } from 'rxjs';
// import { User } from 'src/app.service';

export class GptInterceptor implements NestInterceptor {
 intercept(context: ExecutionContext, handler: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { body, user } = request;
    if (user.limit && user.limit >= 10) {
      throw new ForbiddenException('Превышен лимит бесплатных запросов. Чтобы продолжить пользоваться сервисом, пожалуйста, обновите ваш план https://app.aichatset.ru/#/pricing');
    }
    let tokenCounts = 0;
    // console.log(body);
    body.messages = body.messages.map(message => {
        // console.log(message)
        // message.content = message.content.substring(0, 500);
        console.log(message)
        if (message.role === 'assistant') {
            message.content = '';
        }
        const tokens = encode(message.content);
        // if (message.role === 'user') {
            tokenCounts += tokens.length;
        // }
        // tokenCounts = tokens.length;
        return message;
    });
    request.tokenCounts = tokenCounts;
    console.log('tokenCounst', tokenCounts);
    return handler.handle();
 }
}

export class ClaudeInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, handler: CallHandler): Observable<any> {
       const request = context.switchToHttp().getRequest();
       const { body } = request;
       let tokenCounts = 0;
       console.log(body);
       body.messages = body.messages.map(message => {
           console.log(message)
           message.content = message.content.substring(0, 500);
           const tokens = encode(message.content);
           // if (message.role === 'user') {
               tokenCounts += tokens.length;
           // }
           // tokenCounts = tokens.length;
           return message;
       });
       request.tokenCounts = tokenCounts;
       console.log('tokenCounst', tokenCounts);
       return handler.handle();
    }
   }