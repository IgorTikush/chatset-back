import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Limit extends Document {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  availableTokens: number;

  @Prop({ required: true })
  usedTokens: number;

  @Prop({ required: true })
  expiredAt: Date;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const LimitSchema = SchemaFactory.createForClass(Limit);
