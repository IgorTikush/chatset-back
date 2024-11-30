import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter, NestExpressApplication } from '@nestjs/platform-express';
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
  app.use(express.urlencoded({ extended: true }));

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
