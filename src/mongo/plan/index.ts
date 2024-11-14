import * as mongoose from 'mongoose';

export const PlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
  },
}, {
  timestamps: true,
});
