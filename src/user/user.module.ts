import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import * as config from 'config';

import { UserController } from './user.controller';
import { UserService } from './user.service';
import { BillingModule } from '../billing/billing.module';
import { UserInst } from '../mongo';
import { TokenModule } from '../token/token.module';

@Module({
  imports: [
    UserInst,
    TokenModule,
    JwtModule.register({ secret: config.get('jwtAccessSecret') }),
    BillingModule,
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
