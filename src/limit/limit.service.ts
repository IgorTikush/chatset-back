import { Injectable } from '@nestjs/common';

import { LimitRepository } from './limit.repository';
import { Limit } from './models/limit.model';
import { PlanService } from '../plan/plan.service';

@Injectable()
export class LimitService {
  private readonly modelsAmplification = {
    input: {
      'gpt-4o': 0.25,
      'claude-3-5-sonnet-20240620': 1.17,
    },
    output: {
      'gpt-4o': 1,
      'claude-3-5-sonnet-20240620': 1.5,
    },
  };

  private readonly modelsAmplificationForDalle = {
    'hd': {
      '1024x1024': 16000,
      '1792x1024': 24000,
      '1024x1792': 24000,
    },
    'standard': {
      '1024x1024': 8000,
      '1792x1024': 16000,
      '1024x1792': 16000,
    },
  };

  private readonly modelsAmplificationForStableDiffusion = {
    'ultra': 16000,
    'core': 6000,
    'sd3-medium': 7000,
    'sd3-large': 13000,
    'sd3-large-turbo': 8000,
  };

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
      planName: plan?.name,
    });

    return limit;
  }

  async getLimits(userId: string): Promise<Limit> {
    const limit = await this.limitRepository.findCurrentByUserId(userId);

    return limit;
  }

  async addUsedTokens({ inputTokens, outputTokens, userId, model }: { inputTokens: number; outputTokens: number; userId: string; model: string }): Promise<void> {
    const chatsetTokens = this.countChatSetTokensForText(model, inputTokens, outputTokens);

    await this.limitRepository.addUsedTokens(chatsetTokens, userId);
  }

  countChatSetTokensForText(model: string, inputTokens: number, outputTokens: number): number {
    const chatsetInputTokens = inputTokens * this.modelsAmplification.input[model];
    const chatsetOutputTokens = outputTokens * this.modelsAmplification.output[model];
    const totalChatsetTokens = chatsetInputTokens + chatsetOutputTokens;

    return totalChatsetTokens;
  }

  async addUsedTokensForImage(userId: string, resolution: string, quality: string): Promise<void> {
    const chatsetTokens = this.modelsAmplificationForDalle[quality][resolution];
    await this.limitRepository.addUsedTokens(chatsetTokens, userId);
  }

  async addUsedTokensForStableDiffusion(userId: string, model: string): Promise<void> {
    const chatsetTokens = this.modelsAmplificationForStableDiffusion[model];
    await this.limitRepository.addUsedTokens(chatsetTokens, userId);
  }

  async cancelSubscription(userId: string): Promise<void> {
    await this.limitRepository.cancelSubscription(userId);
  }
}
