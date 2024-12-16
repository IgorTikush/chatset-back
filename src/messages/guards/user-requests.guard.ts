import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { BillingService } from 'src/billing/billing.service';

import { UserService } from '../../user/user.service';

@Injectable()
export class UserRequestsGuard implements CanActivate {
  constructor(
    private readonly userService: UserService,
    private readonly billingService: BillingService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { user } = request;

    const userWithRequests = await this.userService.findUserById(user._id);
    const today = new Date().toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).split('.').join('-');

    // console.log('today', today);
    // Check if user has any payments
    const hasPayments = await this.billingService.isUserHasPayment(user._id);
    let currentLimits = 0;
    // If user has no payments and more than 5 requests, throw error
    if (!hasPayments) {
      const limits = userWithRequests.limits || { [today]: 0 };
      const isTodayLimits = Object.keys(limits)[0] === today;

      if (isTodayLimits) {
        currentLimits = Object.values(limits)[0] as number || 0;
      } else {
        currentLimits = 0;
      }
      // if (currentLimits && (isTodayLimits && currentLimits >= 5)) {
      //   throw new ForbiddenException('Превышен лимит бесплатных запросов. Чтобы продолжить пользоваться сервисом, пожалуйста, обновите ваш план https://app.aichatset.ru/#/pricing');
      // }
    }

    request.user.limit = currentLimits;
    await this.userService.updateLimits(user._id, {
      [today]: currentLimits + 1,
    });

    return true;
  }
}
