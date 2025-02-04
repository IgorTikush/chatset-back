import { ExecutionContext, Injectable, NestInterceptor, CallHandler } from '@nestjs/common';
import * as Sentry from '@sentry/node';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class SentryInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      tap(null, (exception) => {
        if (exception.status < 500) {
          return;
        }

        // const [req] = context.getArgs();

        // const { headers = {} } = req;

        // const ctx = context.switchToHttp();
        // const request = ctx.getRequest();
        // const { ip: userIP = 'unknown' } = request || {};
        // const { _id: userId } = req.user || {};

        Sentry.captureException(exception);
      }),
    );
  }
}
