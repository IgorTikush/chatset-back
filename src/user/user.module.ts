import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import * as config from 'config';

import { UserController } from './user.controller';
import { UserService } from './user.service';
import { AuthModule } from '../auth/auth.module';
import { BillingModule } from '../billing/billing.module';
import { UserInst } from '../mongo';
import { TokenModule } from '../token/token.module';

@Global()
@Module({
  imports: [
    UserInst,
    TokenModule,
    JwtModule.register({ secret: config.get('jwtAccessSecret') }),
    BillingModule,
    AuthModule,
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
