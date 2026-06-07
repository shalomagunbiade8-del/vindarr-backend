import { Module } from '@nestjs/common';

import { PayoutsService } from './payouts.service';

import { PayoutsController } from './payouts.controller';

import { WalletsModule } from '../wallets/wallets.module';

import { UsersModule } from '../users/users.module';

import { TypeOrmModule } from '@nestjs/typeorm';

import { Withdrawal } from '../withdrawals/withdrawal.entity';

@Module({

  imports: [
  WalletsModule,
  UsersModule,

  TypeOrmModule.forFeature([
    Withdrawal,
  ]),
],

  providers: [
    PayoutsService,
  ],

  controllers: [
    PayoutsController,
  ],

})

export class PayoutsModule {}