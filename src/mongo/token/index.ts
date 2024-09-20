import * as mongoose from 'mongoose';

export const TokenSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  user: {
    type: mongoose.Types.ObjectId,
    required: true,
  },
  deleted: {
    type: Boolean,
    default: false,
  },
  lastActivity: Date,
}, {
  timestamps: true,
});
