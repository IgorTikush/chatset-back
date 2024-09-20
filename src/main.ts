import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import * as bodyParser from 'body-parser';
import * as compression from 'compression';
import helmet from 'helmet';
import * as logger from 'morgan';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
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
