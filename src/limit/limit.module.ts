import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { LimitController } from './limit.controller';
import { LimitRepository } from './limit.repository';
import { LimitService } from './limit.service';
import { Limit, LimitSchema } from './models/limit.model';
import { PlanModule } from '../plan/plan.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Limit.name, schema: LimitSchema }]),
    PlanModule,
  ],
  controllers: [LimitController],
  providers: [LimitService, LimitRepository],
  exports: [LimitService],
})
export class LimitModule {}
