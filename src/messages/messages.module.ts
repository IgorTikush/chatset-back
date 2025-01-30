import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { MessagesController } from './messages.controller';
import { MessagesRepository } from './messages.repository';
import { MessagesService } from './messages.service';
import { Message, MessageSchema } from './models/message.model';
import { BillingModule } from '../billing/billing.module';
import { GlobalModule } from '../global/global.module';
import { LimitModule } from '../limit/limit.module';
import { UserModule } from '../user/user.module';

@Module({
  controllers: [MessagesController],
  providers: [MessagesService, MessagesRepository],
  imports: [
    UserModule,
    GlobalModule,
    BillingModule,
    LimitModule,
    MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }]),
  ],
})
export class MessagesModule {}
