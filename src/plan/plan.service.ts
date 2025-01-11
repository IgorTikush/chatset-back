import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Plan } from './models/plan.model';

@Injectable()
export class PlanService {
  constructor(@InjectModel(Plan.name) private planModel: Model<Plan>) {}

  async getPlanByPrice(price: number): Promise<Plan | null> {
    return this.planModel.findOne({ price });
  }

  async getPlanById(id: string): Promise<Plan | null> {
    return this.planModel.findById({ _id: id }).lean();
  }
}
