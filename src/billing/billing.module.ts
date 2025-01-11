import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { Payment, PaymentSchema } from './models/payment.model';
import { LimitModule } from '../limit/limit.module';
import { PlanModule } from '../plan/plan.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Payment.name, schema: PaymentSchema },
    ]),
    PlanModule,
    LimitModule,
  ],
  controllers: [BillingController],
  providers: [BillingService],
  exports: [BillingService],
})
export class BillingModule {}
