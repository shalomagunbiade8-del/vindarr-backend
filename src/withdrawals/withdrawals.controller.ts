import {
  Controller,
  Get,
  Patch,
  Param,
  Req,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';

import { WithdrawalsService } from './withdrawals.service';

@Controller('withdrawals')
export class WithdrawalsController {

  constructor(
    private withdrawalsService:
      WithdrawalsService,
  ) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('pending')
  getPending(
    @Req() req,
  ) {

    if (req.user.role !== 'admin') {

      throw new ForbiddenException(
        'Admins only',
      );

    }

    return this.withdrawalsService
      .getPendingWithdrawals();

  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id/pay')
  markPaid(
    @Param('id') id: string,
    @Req() req,
  ) {

    if (req.user.role !== 'admin') {

      throw new ForbiddenException(
        'Admins only',
      );

    }

    return this.withdrawalsService
      .markPaid(
        Number(id),
      );

  }

  @UseGuards(AuthGuard('jwt'))
@Get('me')
getMyWithdrawals(
  @Req() req,
) {

  return this.withdrawalsService
    .getUserWithdrawals(
      req.user.userId,
    );

}

}