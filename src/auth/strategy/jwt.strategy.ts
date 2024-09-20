import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import * as config from 'config';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { TokenService } from '../../token/token.service';
import { UserService } from '../../user/user.service';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get('jwtAccessSecret'),
      passReqToCallback: true,
    });
  }

  async validate(request: any, payload: { jwtid: string; type: 'user'|'dev'; sub: string }) {
    if (!['dev', 'user'].includes(payload?.type)) {
      throw new UnauthorizedException('Invalid token');
    }

    const tokenRegistered = await this.authService.validateToken(payload.jwtid);

    if (!tokenRegistered) {
      throw new UnauthorizedException('Invalid access token');
    }

    if (tokenRegistered.type !== payload.type) {
      throw new UnauthorizedException(`Invalid ${payload.type} token`);
    }

    if (tokenRegistered.deleted) {
      throw new UnauthorizedException('Invalid access token');
    }

    this.tokenService.updateOne({
      _id: payload?.jwtid,
    }, {
      lastActivity: new Date(),
    });

    // Update user & token last activity
    this.userService.updateLastActivity(payload.sub);

    const user = await this.userService.findUserById(payload.sub, {
      password: 0,
      lastActivity: 0,
      updatedAt: 0,
      geolocation: 0,
      __v: 0,
      registrationPlatform: 0,
      previousGoogleClientIds: 0,
      activatedPromoCodes: 0,
      isAdmin: 0,
    });

    if (user?.isBlocked) {
      throw new ForbiddenException('Your account has been banned');
    }

    return {
      sub: user,
      _id: payload.sub,
      jwtid: payload?.jwtid,
    };
  }
}
