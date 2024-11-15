import { Injectable } from '@nestjs/common';
import { BankWebhookEvent } from './types/bank-webhook-event';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Payment, PaymentDocument } from './models/payment.model';

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
    const payment = await this.paymentModel.findOne({ userId });
    return !!payment;
  }
}
