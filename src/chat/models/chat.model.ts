import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Chat extends Document {
  @Prop({ required: true })
  userId: string;

  @Prop({ type: String })
  title: string;

  @Prop({ type: String })
  model: string;
}

export const ChatSchema = SchemaFactory.createForClass(Chat);
