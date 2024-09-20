import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import * as config from 'config';
import { MorganInterceptor, MorganModule } from 'nest-morgan';

import { AuthModule } from './auth/auth.module';
import { TokenModule } from './token/token.module';
import { UserModule } from './user/user.module';
import { MessagesModule } from './messages/messages.module';

@Module({
  imports: [
    MongooseModule.forRoot(config.get('mongo')),
    MorganModule,
    TokenModule,
    UserModule,
    AuthModule,
    MessagesModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: MorganInterceptor('combined'),
    },
  ],
})
export class AppModule {}
