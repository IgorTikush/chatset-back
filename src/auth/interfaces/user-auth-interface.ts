import * as mongoose from 'mongoose';

export interface IUserAuth {
  _id: mongoose.Types.ObjectId;
  isBlocked: boolean;
  email: string;
}
