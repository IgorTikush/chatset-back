import { Module } from '@nestjs/common';

import { TokenService } from './token.service';
import { TokenInst } from '../mongo';

@Module({
  imports: [TokenInst],
  providers: [TokenService],
  exports: [TokenService],
})
export class TokenModule {}
