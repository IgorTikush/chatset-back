import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { SentryModule, SentryGlobalFilter } from '@sentry/nestjs/setup';
import * as config from 'config';
import { MorganInterceptor, MorganModule } from 'nest-morgan';

import { AuthModule } from './auth/auth.module';
import { BillingModule } from './billing/billing.module';
import { GlobalModule } from './global/global.module';
import { LimitModule } from './limit/limit.module';
import { MessagesModule } from './messages/messages.module';
import { PlanModule } from './plan/plan.module';
import { TokenModule } from './token/token.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    MongooseModule.forRoot(config.get('mongo')),
    MorganModule,
    TokenModule,
    UserModule,
    AuthModule,
    MessagesModule,
    GlobalModule,
    BillingModule,
    LimitModule,
    PlanModule,
    SentryModule.forRoot(),
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: MorganInterceptor('combined'),
    },
    {
      provide: APP_FILTER,
      useClass: SentryGlobalFilter,
    },
  ],
})
export class AppModule {}
