import { Module } from '@nestjs/common';
import { GlobalService } from './global.service';
import { GlobalInst } from '../mongo';

@Module({
  providers: [GlobalService],
  exports: [GlobalService],
  imports: [
    GlobalInst,
  ]
})
export class GlobalModule {}
