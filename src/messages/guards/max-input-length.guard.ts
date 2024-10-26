import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
// import { User } from 'src/app.service';

export class CustomInterceptors implements NestInterceptor {
 intercept(context: ExecutionContext, handler: CallHandler): Observable<any> {
    const { body } = context.switchToHttp().getRequest();
    body.messages = body.messages.map(message => {
        message.content = message.content.substring(0, 500);
        return message;
    });

    return handler.handle();
 }
}