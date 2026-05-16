import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ConfigModule } from '@nestjs/config';

import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { StoriesModule } from './stories/stories.module';
import { VideosModule } from './videos/videos.module';
import { ProfileModule } from './profile/profile.module';
import { CommentsModule } from './comments/comments.module';

import { MessagesModule } from './messages/messages.module';

import { PaymentsModule } from './payments/payments.module';
import { OrdersModule } from './orders/orders.module';

import { WalletsModule } from './wallets/wallets.module';
import { LibraryModule } from './library/library.module';
import { PayoutsModule } from './payouts/payouts.module';

import { UploadController } from './upload/upload.controller';

import { User } from './users/user.entity';
import { Video } from './videos/video.entity';
import { Understand } from './understand/understand.entity';
import { Comment } from './comments/comment.entity';

import { Coach } from './coaches/coach.entity';
import { Session } from './sessions/session.entity';
import { Resource } from './resources/resource.entity';
import { Order } from './orders/order.entity';

import { Wallet } from './wallets/wallet.entity';

import { Library } from './library/library.entity';

@Module({
  imports: [
  ConfigModule.forRoot({
    isGlobal: true,
  }),

  TypeOrmModule.forRoot({
    type: 'postgres',

    url: process.env.DATABASE_URL,

    autoLoadEntities: true,

    entities: [
      User,
      Video,
      Understand,
      Comment,
      Coach,
      Session,
      Resource,
      Order,
Wallet,
Library,
    ],

    synchronize: true,

    ssl: {
      rejectUnauthorized: false,
    },

    extra: {
      ssl: {
        rejectUnauthorized: false,
      },
    },

    retryAttempts: 5,
    retryDelay: 3000,
  }),

  // ✅ KEEP ONLY THESE

  UsersModule,
  AuthModule,
  ProfileModule,
VideosModule,
CommentsModule,
OrdersModule,

PaymentsModule,
WalletsModule,
PayoutsModule,
LibraryModule,
],

  // =====================================
  // CONTROLLERS
  // =====================================

  controllers: [],
})
export class AppModule {}