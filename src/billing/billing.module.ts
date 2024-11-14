import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { Payment, PaymentSchema } from './models/payment.model';
import { PlanInst } from 'src/mongo';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Payment.name, schema: PaymentSchema },
    ]),
    PlanInst,
  ],
  controllers: [BillingController],
  providers: [BillingService],
})
export class BillingModule {}