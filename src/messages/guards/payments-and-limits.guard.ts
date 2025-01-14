import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

import { LimitService } from '../../limit/limit.service';
import { UserService } from '../../user/user.service';

@Injectable()
export class PaymentAndLimitsGuard implements CanActivate {
  constructor(
    private readonly limitService: LimitService,
    private readonly userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { user } = request;
    const { model } = request.body;

    const limits = await this.limitService.getLimits(user._id);

    // на бесплатной подписке можно использовать только GPT 4o-mini
    if (!limits && model !== 'GPT 4o-mini') {
      throw new ForbiddenException(
        'Данная модель доступна только для платной подписки. Пожалуйста, обновите ваш план https://app.aichatset.ru/#/pricing',
      );
    }

    // на бесплатной подписке доступно только 5 запросов в день
    if (model === 'GPT 4o-mini' && !limits) {
      // console.log('limits', limits);
      let currentLimits = 0;
      const today = new Date().toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).split('.').join('-');

      const requestsCount = user.sub.limits || { [today]: 0 };
      const isTodayLimits = Object.keys(requestsCount)[0] === today;

      if (isTodayLimits) {
        currentLimits = Object.values(requestsCount)[0] as number || 0;
      } else {
        currentLimits = 0;
      }

      if (currentLimits && currentLimits >= 5) {
        throw new ForbiddenException(
          'Превышен лимит бесплатных запросов.Чтобы продолжить пользоваться сервисом, пожалуйста, обновите ваш план https://app.aichatset.ru/#/pricing',
        );
      }

      await this.userService.updateLimits(user._id, {
        [today]: currentLimits + 1,
      });

      return true;
    }

    // на платной подписке можно использовать любую модель, но считаем токены на всех моделях кроме GPT 4o-mini
    if (limits && model !== 'GPT 4o-mini') {
      if (limits.usedTokens > limits.availableTokens) {
        throw new ForbiddenException('Превышен лимит токенов. Докупите токены либо воспользуйтесь безлимитной моделью GPT 4o-mini');
      }
    }

    return true;
  }
}
