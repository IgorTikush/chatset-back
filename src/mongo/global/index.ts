import * as mongoose from 'mongoose';

export const GlobalSchema = new mongoose.Schema({
  date: String,
  gptInputTokens: Number,
  gptOutputTokens: Number,
}, {
  timestamps: true,
});
