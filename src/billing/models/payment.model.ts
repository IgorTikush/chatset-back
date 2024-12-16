import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PaymentDocument = Payment & Document;

@Schema({ timestamps: true })
export class Payment {
  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  status: string;

  @Prop({ required: true })
  transactionId: string;

  @Prop()
  userId: string;

  @Prop()
  planId: string;

  @Prop()
  planName: string;

  @Prop()
  expiresIn: Date;

  @Prop({ type: Object })
  metadata?: Record<string, unknown>;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
