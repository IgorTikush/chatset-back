import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as config from 'config';
import { Model } from 'mongoose';

import { Payment, PaymentDocument } from './models/payment.model';
import { LimitService } from '../limit/limit.service';
import { PlanService } from '../plan/plan.service';

@Injectable()
export class BillingService {
  constructor(
    private readonly planService: PlanService,
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    private readonly limitService: LimitService,
  ) {}

  async getPlan(price: number) {
    return this.planService.getPlanByPrice(price);
  }

  async processPayment(paymentData: Partial<Payment>): Promise<Payment> {
    await this.limitService.createLimit(paymentData.userId, paymentData.planId, paymentData.expiresIn);
    const payment = new this.paymentModel(paymentData);

    return payment.save();
  }

  async isUserHasPayment(userId: string): Promise<boolean> {
    const payment = await this.paymentModel.findOne({ userId, expiresIn: { $gt: new Date() } });

    return !!payment;
  }

  async getLastActiveUserPayment(userId: string) {
    return this.paymentModel.findOne({ userId, expiresIn: { $gt: new Date() } }, { planName: 1, expiresIn: 1 }).lean();
  }

  getPaymentsByUser(userId: string) {
    return this.paymentModel.find({ userId }, { createdAt: 1, amount: 1 });
  }

  async cancelSubscription(userId: string) {
    const username = config.get('cloudpayments.username');
    const password = config.get('cloudpayments.password');
    const credentials = Buffer.from(`${username}:${password}`).toString('base64');
    console.log(userId);
    const subscription = await fetch('https://api.cloudpayments.ru/subscriptions/find', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${credentials}`,
      },
      body: JSON.stringify({
        accountId: userId.toString(),
      }),
    }).then(res => res.json());

    console.log(subscription);
    if (!subscription.Model[0]) {
      throw new NotFoundException('Subscription not found');
    }

    const subscriptionId = subscription.Model[0].Id;

    await this.paymentModel.updateOne(
      { userId, expiresIn: { $gt: new Date() } },
      { canceled: true },
    ).then(res => console.log(res));

    const res = await fetch('https://api.cloudpayments.ru/subscriptions/cancel', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${credentials}`,
      },
      body: JSON.stringify({
        Id: subscriptionId,
      }),
    }).then(res2 => res2.json());

    await this.paymentModel.deleteMany({ userId });
  }
}
