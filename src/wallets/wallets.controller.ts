import {
  Controller,
  Get,
  Req,
  UseGuards,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';

import { WalletsService } from './wallets.service';

@Controller('wallets')

export class WalletsController {

  constructor(
    private walletsService: WalletsService,
  ) {}

  // =====================================
  // MY WALLET
  // =====================================

  @UseGuards(AuthGuard('jwt'))
  @Get('me')

  getMyWallet(@Req() req) {

    return this.walletsService.getBalance(
      req.user.userId,
    );

  }

}