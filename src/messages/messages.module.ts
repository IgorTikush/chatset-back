import { Module } from '@nestjs/common';

import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import { UserModule } from '../user/user.module';

@Module({
  controllers: [MessagesController],
  providers: [MessagesService],
  imports: [
    UserModule,
  ],
})
export class MessagesModule {}
