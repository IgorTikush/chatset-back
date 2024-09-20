import { IBaseMongoDoc } from '../../mongo/interfaces/mongo.interfaces';

export interface IUser {
  email: string;
  password: string;
  isBlocked: boolean;
}

export interface IUserDoc extends IUser, IBaseMongoDoc {}
