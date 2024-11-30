import { Controller, Post, Body, UseGuards, Get, Req, Header } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { BillingService } from './billing.service';
import { Payment } from './models/payment.model';
import { BankWebhookEvent } from './types/bank-webhook-event';

@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  // @Get('payments')
  // @UseGuards(AuthGuard('jwt'))
  // async getUserPayments(@Req() { user }) {
  //   const userId = user._id;

  //   const payments = await this.billingService.getPaymentsByUser(userId);

  //   return { payments };
  // }

  @Post('webhook')
  @Header('Content-Type', 'application/x-www-form-urlencoded')
  async handleBankEvent(@Body() event: BankWebhookEvent) {
    console.log('event', event);
    console.log('event.Status', event.Data);
    if (event.Status !== 'Completed') {
      return 'ok';
    }

    console.log('event', Number(event.Amount) * 100);
    const plan = await this.billingService.getPlan(Number(event.Amount) * 100);
    if (!plan) {
      throw new Error('Plan not found');
    }

    const payment = await this.billingService.processPayment({
      amount: Number(event.Amount),
      status: event.Status,
      transactionId: event.TransactionId,
      planId: plan.id,
      metadata: event,
      userId: event.AccountId,
      planName: plan.name,
    });

    console.log('payment', payment);

    return { code: 0 };
  }
}
