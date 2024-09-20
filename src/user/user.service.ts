import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { hash } from 'argon2';
import * as config from 'config';
import { Model } from 'mongoose';

import { IUser, IUserDoc } from './interfaces/IUser.interface';
import { CreateUserValidation } from './validations/create-user-validations';
import { ITokenDoc } from '../token/interfaces/token.interface';
import { TokenService } from '../token/token.service';

@Injectable()
export class UserService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<IUser>,
    private readonly tokenService: TokenService,
    private readonly jwtService: JwtService,
  ) {}

  async create(userInfo: CreateUserValidation) {
    const { email, password, passwordConfirm } = userInfo;

    if (password !== passwordConfirm) {
      throw new BadRequestException('Passwords do not match');
    }

    const isUserAlreadyRegistered = !!await this.findByEmail(email);
    if (isUserAlreadyRegistered) {
      throw new ConflictException('User already registered');
    }

    const hashedPassword: string = await hash(password);

    const newUser: IUserDoc = await this.userModel.create({
      email,
      password: hashedPassword,
    }) as any;

    const { _id: userId } = newUser;

    return this.getTokens({ userId });
  }

  async getTokens({ userId }) {
    const authToken: ITokenDoc = await this.tokenService.create({
      user: userId,
      type: 'user',
      deleted: false,
    });

    return this.login(authToken);
  }

  async login(tokenInfo: ITokenDoc) {
    const tokenPayload = {
      jwtid: tokenInfo._id.toString(),
      type: 'user',
      sub: tokenInfo.user,
    };

    const accessPayload = {
      sub: tokenInfo.user,
      type: 'access',
    };

    const refreshPayload = {
      sub: tokenInfo.user,
      type: 'refresh',
    };

    const refreshJwtService = new JwtService({
      secret: config.get('jwtRefreshSecret'),
    });

    return {
      _id: tokenInfo.user.toString(),
      token: this.jwtService.sign(tokenPayload, {
        noTimestamp: true,
      }),
      access_token: this.jwtService.sign(accessPayload, {
        expiresIn: '5m',
      }),
      refresh_token: refreshJwtService.sign(refreshPayload),
    };
  }

  findByEmail(email: string): Promise<IUserDoc> {
    return this.userModel.findOne({
      email,
    });
  }

  async updateLastActivity(id: string) {
    return this.userModel.updateOne({
      _id: id,
    }, {
      $set: {
        lastActivity: new Date(),
      },
    });
  }

  findUserById(id: string, projection = {}): Promise<any> {
    return this.userModel.findOne({ _id: id }, projection).lean() as any;
  }
}
