import { Injectable } from '@nestjs/common';

import { LimitRepository } from './limit.repository';
import { Limit } from './models/limit.model';
import { PlanService } from '../plan/plan.service';

@Injectable()
export class LimitService {
  constructor(
    private readonly planService: PlanService,
    private readonly limitRepository: LimitRepository,
  ) {}

  async createLimit(userId: string, planId: string, paymentExpires): Promise<Limit> {
    const plan = await this.planService.getPlanById(planId);
    console.log(plan.tokens);
    const limit = await this.limitRepository.create(userId, {
      tokens: plan?.tokens,
      expiresIn: paymentExpires,
    });

    return limit;
  }

  async getLimits(userId: string): Promise<Limit> {
    const limit = await this.limitRepository.findCurrentByUserId(userId);

    return limit;
  }

  // async getLimitByUserId(userId: string): Promise<Limit> {
  //   const limit = await this.limitModel.findOne({ userId });
  //   if (!limit) {
  //     throw new NotFoundException('Limit not found');
  //   }

  //   return limit;
  // }

  // async updateLimit(userId: string, maxLimit: number): Promise<Limit> {
  //   const limit = await this.limitModel.findOneAndUpdate(
  //     { userId },
  //     { maxLimit },
  //     { new: true },
  //   );

  //   if (!limit) {
  //     throw new NotFoundException('Limit not found');
  //   }

  //   return limit;
  // }
}
