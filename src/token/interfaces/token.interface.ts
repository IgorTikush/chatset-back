import * as mongoose from 'mongoose';

import { IBaseMongoDoc } from '../../mongo/interfaces/mongo.interfaces';

export interface ITokenInfo  {
  user: mongoose.Types.ObjectId;
  type: 'dev'|'admin'|'user';
  deleted: boolean;
}

export interface IFindToken {
  readonly _id?: IToken['_id'];
  readonly user?: IToken['user'];
  readonly name?: IToken['name'];
  readonly type?: IToken['type'];
  readonly deleted?: IToken['deleted'];
  readonly createdAt?: IToken['createdAt'];
  readonly updatedAt?: IToken['updatedAt'];
  readonly lastActivity?: IToken['lastActivity'];
}

export interface IToken {
  _id: any;
  readonly user: string;
  readonly name: string;
  readonly type: 'dev'|'admin'|'user';
  readonly deleted: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly lastActivity: Date;
}

export interface ITokenDoc extends IBaseMongoDoc, ITokenInfo {}
