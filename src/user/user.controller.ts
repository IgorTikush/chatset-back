import { Controller, Post, Body, UseGuards, Req, Get, UseInterceptors, ClassSerializerInterceptor } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { UserResponseDTO } from './dto/user-response.dto';
import { UserTokensDTO } from './dto/user-tokens.dto';
import { UserService } from './user.service';
import { CreateUserValidation } from './validations/create-user-validations';
import { UserLoginGuard } from '../auth/guards/login.guard';
import { BillingService } from '../billing/billing.service';

@Controller('user')
  @UseInterceptors(ClassSerializerInterceptor)
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly billingService: BillingService,
  ) {}

  @Post()
  async create(@Body() userInfo: CreateUserValidation): Promise<UserTokensDTO> {
    const userTokens = await this.userService.create(userInfo);

    return new UserTokensDTO(userTokens);
  }

  @Post('login')
  @UseGuards(UserLoginGuard)
  async login(@Req() req): Promise<UserTokensDTO> {
    const userId = req.user._id;
    const userTokens = await this.userService.getTokens({ userId });

    return new UserTokensDTO(userTokens);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async getUser(@Req() { user }): Promise<UserResponseDTO> {
    const userActivePayment = await this.billingService.getLastActiveUserPayment(user._id);
    const userDoc = await this.userService.findUserById(user._id);
    console.log(userActivePayment);

    return new UserResponseDTO({
      ...userDoc,
      lastPayment: userActivePayment,
    });
  }
}
