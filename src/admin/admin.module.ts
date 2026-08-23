import {
  Module,
} from '@nestjs/common';

import {
  TypeOrmModule,
} from '@nestjs/typeorm';

import { AdminController } from './admin.controller';

import { AdminService } from './admin.service';

import { User } from '../users/user.entity';

import { Video } from '../videos/video.entity';

import { Order } from '../orders/order.entity';

import { Withdrawal } from '../withdrawals/withdrawal.entity';

@Module({

  imports: [

    TypeOrmModule.forFeature([

      User,

      Video,

      Order,

      Withdrawal,

    ]),

  ],

  controllers: [

    AdminController,

  ],

  providers: [

    AdminService,

  ],

  exports: [

    AdminService,

  ],

})
export class AdminModule {}