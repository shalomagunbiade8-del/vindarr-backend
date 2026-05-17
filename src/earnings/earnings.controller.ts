import {
  Controller,
  Get,
  Req,
  UseGuards,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';

import { EarningsService } from './earnings.service';

@Controller('earnings')
export class EarningsController {

  constructor(
    private earningsService: EarningsService,
  ) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('me')

  getMyEarnings(@Req() req) {

    return this.earningsService.getCreatorEarnings(
      req.user.userId,
    );

  }

}