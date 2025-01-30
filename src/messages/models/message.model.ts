import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Message extends Document {
  @Prop({ type: Types.ObjectId, required: true })
  userId: string;

  // @Prop({ type: Types.ObjectId, required: true })
  // chatId: string;

  @Prop({ type: String, required: true })
  role: 'user' | 'assistant' | 'system';

  @Prop({ type: String, required: true })
  content: string;

  @Prop({ type: String, required: true })
  model: string;

  // @Prop({ type: Number })
  // inputTokens: number;

  // @Prop({ type: Number })
  // outputTokens: number;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
