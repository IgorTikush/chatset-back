import * as mongoose from 'mongoose';

export const GlobalSchema = new mongoose.Schema({
  date: String,
  gptInputTokens: Number,
  gptOutputTokens: Number,
  claudeInputTokens: Number,
  claudeOutputTokens: Number,
}, {
  timestamps: true,
});
