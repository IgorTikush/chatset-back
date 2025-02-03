import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter, NestExpressApplication } from '@nestjs/platform-express';
import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import * as bodyParser from 'body-parser';
import * as compression from 'compression';
import * as express from 'express';
import helmet from 'helmet';
import * as logger from 'morgan';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    new ExpressAdapter(),
  );

  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,POST,DELETE,PATCH,OPTIONS',
    optionsSuccessStatus: 204,
    credentials: true,
  });

  app.use(logger('dev'));
  app.use(compression());
  app.use(helmet());
  app.use(bodyParser.urlencoded({ limit: '24mb', extended: true, parameterLimit: 100000 }));
  // app.use(express.urlencoded({ extended: true }));
  Sentry.init({
    dsn: 'https://49c1d898e6e6b446cdf1bd05e5b97976@sentry-new.amzn.pro/20',
    integrations: [
      // Add our Profiling integration
      nodeProfilingIntegration(),
    ],

    // Add Tracing by setting tracesSampleRate
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0,

    // Set sampling rate for profiling
    // This is relative to tracesSampleRate
    profilesSampleRate: 1.0,
  });

  app.enableShutdownHooks();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      exceptionFactory: (errors => new BadRequestException(errors)),
    }),
  );

  await app.listen(3000);
}

bootstrap();
