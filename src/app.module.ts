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

import { Message } from './messages/message.entity';

import { Library } from './library/library.entity';
import { EarningsModule } from './earnings/earnings.module';
import { SearchModule } from './search/search.module';

import { Story } from './stories/story.entity';
import { WithdrawalsModule } from './withdrawals/withdrawals.module';
import { Withdrawal } from './withdrawals/withdrawal.entity';
import { PurviewModule } from './purview/purview.module';
import { Purview } from './purview/purview.entity';
import { NotificationsModule } from './notifications/notifications.module';
import { Notification } from './notifications/notification.entity';
import { FindModule } from './find/find.module';
import { Find} from './find/find.entity';
import { PollModule } from './poll/poll.module';
import { Poll} from './poll/poll.entity';
import { AdminModule } from './admin/admin.module';
import { CloudinarySignatureModule } from './cloudinary-signature/cloudinary-signature.module';
import { SavedModule } from './saved/saved.module';
import { CollectionsModule } from './collections/collections.module';

import { Saved} from './saved/saved.entity';
import { Collection} from './collections/collection.entity';





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
Story,
Message,
 Withdrawal,
 Purview,
 Notification,
 Find,
 Poll,
 Saved,
 Collection,
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

  // =====================================
// APP MODULES
// =====================================

UsersModule,
AuthModule,
ProfileModule,

VideosModule,
CommentsModule,

StoriesModule,
MessagesModule,

OrdersModule,
PaymentsModule,

WalletsModule,
PayoutsModule,
LibraryModule,
EarningsModule,
SearchModule,
WithdrawalsModule,
PurviewModule,
NotificationsModule,
FindModule,
PollModule,
AdminModule,
CloudinarySignatureModule,
SavedModule,
CollectionsModule,
],

  // =====================================
  // CONTROLLERS
  // =====================================

  controllers: [UploadController],
})
export class AppModule {}