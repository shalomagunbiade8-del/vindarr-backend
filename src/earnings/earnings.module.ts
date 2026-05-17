import { Module } from '@nestjs/common';

import { EarningsController } from './earnings.controller';

import { EarningsService } from './earnings.service';

import { OrdersModule } from '../orders/orders.module';

@Module({

  imports: [
    OrdersModule,
  ],

  controllers: [
    EarningsController,
  ],

  providers: [
    EarningsService,
  ],

})

export class EarningsModule {}