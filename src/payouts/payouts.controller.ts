import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';

import { PayoutsService } from './payouts.service';

@Controller('payouts')

export class PayoutsController {

  constructor(
    private payoutsService: PayoutsService,
  ) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('withdraw')

  withdraw(

    @Req() req,

    @Body()
    body: {
      amount: number;
    },

  ) {

    return this.payoutsService.withdraw(
      req.user.userId,
      Number(body.amount),
    );

  }

}