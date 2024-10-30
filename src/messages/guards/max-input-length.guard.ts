import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { encode } from 'gpt-tokenizer';
import { Observable } from 'rxjs';
// import { User } from 'src/app.service';

export class CustomInterceptors implements NestInterceptor {
 intercept(context: ExecutionContext, handler: CallHandler): Observable<any> {

    const request = context.switchToHttp().getRequest();
    const { body } = request;
    let tokenCounts = 0;
    console.log(body)
    body.messages = body.messages.map(message => {
        console.log(message)
        message.content = message.content.substring(0, 500);
        const tokens = encode(message.content);
        if (message.role === 'user') {
            tokenCounts += tokens.length;
        }
        tokenCounts = tokens.length;
        return message;
    });
    request.tokenCounts = tokenCounts;
    console.log('tokenCounst', tokenCounts);
    return handler.handle();
 }
}