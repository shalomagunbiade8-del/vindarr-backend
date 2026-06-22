import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { Withdrawal } from './withdrawal.entity';

import { WithdrawalsService } from './withdrawals.service';

import { WithdrawalsController } from './withdrawals.controller';

import { NotificationsModule }
from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Withdrawal,
    ]),

     NotificationsModule,
  ],

  providers: [
    WithdrawalsService,
  ],

  controllers: [
    WithdrawalsController,
  ],

  exports: [
    WithdrawalsService,
  ],
})
export class WithdrawalsModule {}