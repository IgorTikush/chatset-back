import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';

import { AuthService } from '../auth.service';
import { IUserAuth } from '../interfaces/user-auth-interface';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super();
  }

  async validate(email: string, password: string): Promise<IUserAuth> {
    console.log('email', email, 'password', password);
    const user: IUserAuth = await this.authService.validateUser(email, password);
    console.log('user', user);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user?.isBlocked) {
      throw new UnauthorizedException('Your account has been banned');
    }

    return user;
  }
}
