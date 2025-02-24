import { Controller, Post, Body, UseGuards, Get, Req, Header, Delete } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { BillingService } from './billing.service';
import { BankWebhookEvent } from './types/bank-webhook-event';

@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get('payments')
  @UseGuards(AuthGuard('jwt'))
  async getUserPayments(@Req() { user }) {
    const userId = user._id;

    const payments = await this.billingService.getPaymentsByUser(userId);

    return { payments };
  }

  @Post('webhook')
  @Header('Content-Type', 'application/x-www-form-urlencoded')
  async handleBankEvent(@Body() event: BankWebhookEvent) {
    if (event.Status !== 'Completed') {
      return 'ok';
    }

    const amount = Number(event.Amount.replace(',', '.'));
    const plan = await this.billingService.getPlan(amount * 100);
    if (!plan) {
      throw new Error('Plan not found');
    }

    const currentDate = new Date();
    const expirationDate = new Date(currentDate.setMonth(currentDate.getMonth() + 1));

    await this.billingService.processPayment({
      amount,
      status: event.Status,
      transactionId: event.TransactionId,
      planId: plan.id,
      metadata: event,
      userId: event.AccountId,
      planName: plan.name,
      expiresIn: expirationDate,
    });

    return { code: 0 };
  }

  @Delete('subscription')
  @UseGuards(AuthGuard('jwt'))
  async cancelSubscription(@Req() { user }) {
    const userId = user._id;

    await this.billingService.cancelSubscription(userId);

    return { code: 0 };
  }
}
