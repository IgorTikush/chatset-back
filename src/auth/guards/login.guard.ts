import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';

import { AuthService } from '../auth.service';
import { IUserAuth } from '../interfaces/user-auth-interface';

@Injectable()
export class UserLoginGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const { email, password } = request.body;

    const user: IUserAuth = await this.authService.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user?.isBlocked) {
      throw new UnauthorizedException('Your account has been banned');
    }

    request.user = user;

    return true;
  }
}

