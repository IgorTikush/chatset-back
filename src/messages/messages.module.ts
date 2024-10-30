import { Module } from '@nestjs/common';

import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import { UserModule } from '../user/user.module';
import { GlobalModule } from '../global/global.module';

@Module({
  controllers: [MessagesController],
  providers: [MessagesService],
  imports: [
    UserModule,
    GlobalModule,
  ],
})
export class MessagesModule {}
