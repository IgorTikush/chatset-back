import { Module } from '@nestjs/common';

import { AuthService } from './auth.service';
import { JwtStrategy } from './strategy/jwt.strategy';
import { TokenModule } from '../token/token.module';

@Module({
  imports: [
    TokenModule,
  ],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
