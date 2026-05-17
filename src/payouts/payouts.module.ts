import { Module } from '@nestjs/common';

import { PayoutsService } from './payouts.service';

import { PayoutsController } from './payouts.controller';

import { WalletsModule } from '../wallets/wallets.module';

import { UsersModule } from '../users/users.module';

@Module({

  imports: [
    WalletsModule,
    UsersModule,
  ],

  providers: [
    PayoutsService,
  ],

  controllers: [
    PayoutsController,
  ],

})

export class PayoutsModule {}