import * as mongoose from 'mongoose';

export interface IBaseMongoDoc {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
}
