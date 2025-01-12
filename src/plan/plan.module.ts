import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Plan } from './models/plan.model';
import { PlanService } from './plan.service';
import { PlanSchema } from '../mongo/plan';

@Module({
  imports: [MongooseModule.forFeature([{ name: Plan.name, schema: PlanSchema }])],
  providers: [PlanService],
  exports: [PlanService],
})
export class PlanModule {}

