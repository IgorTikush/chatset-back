import * as mongoose from 'mongoose';

export const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  requests: Number,
  password: String,
  isBlocked: Boolean,
  lastActivity: Date,
  limits: Object,
}, {
  timestamps: true,
});
