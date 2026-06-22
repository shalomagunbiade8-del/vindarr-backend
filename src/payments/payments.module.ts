import { Module } from '@nestjs/common';

import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';

import { SessionsModule } from '../sessions/sessions.module';
import { OrdersModule } from '../orders/orders.module';

import { UsersModule } from '../users/users.module';
import { VideosModule } from '../videos/videos.module';

import { WalletsModule } from '../wallets/wallets.module';
import { LibraryModule } from '../library/library.module';

import { NotificationsModule }
from '../notifications/notifications.module';

@Module({

  imports: [

    SessionsModule,

    OrdersModule,

    UsersModule,

    VideosModule,

    WalletsModule,

    LibraryModule,

    NotificationsModule,

  ],

  providers: [
    PaymentsService,
  ],

  controllers: [
    PaymentsController,
  ],

  exports: [
    PaymentsService,
  ],

})

export class PaymentsModule {}