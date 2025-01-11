import { Module } from '@nestjs/common';

import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import { BillingModule } from '../billing/billing.module';
import { GlobalModule } from '../global/global.module';
import { LimitModule } from '../limit/limit.module';
import { UserModule } from '../user/user.module';

@Module({
  controllers: [MessagesController],
  providers: [MessagesService],
  imports: [
    UserModule,
    GlobalModule,
    BillingModule,
    LimitModule,
  ],
})
export class MessagesModule {}
