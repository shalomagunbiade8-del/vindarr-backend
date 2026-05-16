import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { OrdersController } from './orders.controller';

import { OrdersService } from './orders.service';

import { Order } from './order.entity';

import { Video } from '../videos/video.entity';

import { User } from '../users/user.entity';

@Module({

  imports: [

    TypeOrmModule.forFeature([
      Order,
      Video,
      User,
    ]),

  ],

  controllers: [
    OrdersController,
  ],

  providers: [
    OrdersService,
  ],

  exports: [
    OrdersService,
  ],

})

export class OrdersModule {}