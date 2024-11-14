import { Controller, Post, Body } from '@nestjs/common';

import { BankWebhookEvent } from './types/bank-webhook-event';
import { BillingService } from './billing.service';
import { Payment } from './models/payment.model';

@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Post('webhook')
  async handleBankEvent(@Body() event: BankWebhookEvent) {
    console.log('event', event);
    if (event.Status !== 'CONFIRMED') {
        return 'ok';
    }
    console.log('event', event);
    const plan = await this.billingService.getPlan(event.Amount);
    if (!plan) {
      throw new Error('Plan not found');
    }
    
    const payment = await this.billingService.processPayment({
      amount: event.Amount,
      status: event.Status,
      transactionId: event.OrderId,
      planId: plan.id,
      metadata: event,
      userId: event.Data.Number.trim(),
      planName: plan.name,
    });
    console.log('payment', payment);
    return 'ok';
  }
} 