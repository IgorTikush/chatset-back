import { Module } from '@nestjs/common';

import { AuthService } from './auth.service';
import { JwtStrategy } from './strategy/jwt.strategy';
import { LocalStrategy } from './strategy/login.strategy';
import { TokenModule } from '../token/token.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    UserModule,
    TokenModule,
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy],
})
export class AuthModule {}
