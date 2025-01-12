import { Controller, Get, Post, Put, Body, Param } from '@nestjs/common';

import { LimitService } from './limit.service';

@Controller('limits')
export class LimitController {
  constructor(private readonly limitService: LimitService) {}

  // @Post()
  // async createLimit(@Body() body: { userId: string; maxLimit: number }) {
  //   return this.limitService.createLimit(body.userId, body.maxLimit);
  // }

  // @Get(':userId')
  // async getLimit(@Param('userId') userId: string) {
  //   return this.limitService.getLimitByUserId(userId);
  // }

  // @Put(':userId')
  // async updateLimit(
  //   @Param('userId') userId: string,
  //   @Body() body: { maxLimit: number },
  // ) {
  //   return this.limitService.updateLimit(userId, body.maxLimit);
  // }
}
