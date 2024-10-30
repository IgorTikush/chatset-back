import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class GlobalService {
  constructor(
    @InjectModel('Global') private readonly globalModel: Model<any>,
  ) {}

  async addGptInputToken(tokensCount: number) {
    const currentDate = new Date();

    const day = String(currentDate.getDate()).padStart(2, '0');
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const year = currentDate.getFullYear();
    const formattedDate = `${day}-${month}-${year}`;
    const insertRes = await this.globalModel.updateOne({
      date: formattedDate,
    }, {
      $inc: {
        gptInputTokens: tokensCount,
      },
    }, {
      new: true,
      upsert: true,
    }).then(console.log).catch(console.log);
  }
}
