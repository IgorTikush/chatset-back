import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { IFindToken, ITokenDoc, ITokenInfo } from './interfaces/token.interface';

@Injectable()
export class TokenService {
  constructor(
    @InjectModel('Token') private readonly tokenModel: Model<ITokenDoc>,
  ) {}

  create(tokenData: ITokenInfo) {
    return this.tokenModel.create(tokenData);
  }

  async findByTokenId(tokenId: string) {
    return this.tokenModel.findOne({
      _id: tokenId,
    }, {
      type: 1,
      deleted: 1,
    }).lean();
  }

  async updateOne(conditions: IFindToken = {}, set: IFindToken = {}) {
    return this.tokenModel.updateOne(conditions, {
      $set: set,
    });
  }
}
