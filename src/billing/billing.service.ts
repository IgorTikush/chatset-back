import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Payment, PaymentDocument } from './models/payment.model';
import { BankWebhookEvent } from './types/bank-webhook-event';

@Injectable()
export class BillingService {
  constructor(
    @InjectModel('Plan') private readonly planModel: Model<{name: string; price: number}>,
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
  ) {}

  async getPlan(price: number) {
    const plan = await this.planModel.findOne({ price });

    return plan;
  }

  async processPayment(paymentData: Partial<Payment>): Promise<Payment> {
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
}
