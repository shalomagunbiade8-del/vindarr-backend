import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { StoriesModule } from './stories/stories.module';
import { VideosModule } from './videos/videos.module';
import { ProfileModule } from './profile/profile.module';
import { Understand } from './understand/understand.entity'; 
import { Video } from './videos/video.entity';
import { User } from './users/user.entity';
import { CommentsModule } from './comments/comments.module';
import { Comment } from './comments/comment.entity'; 
import { CoachesModule } from './coaches/coaches.module';
import { SessionsModule } from './sessions/sessions.module';
import { ResourcesModule } from './resources/resources.module';
import { Coach } from './coaches/coach.entity';
import { Session } from './sessions/session.entity';
import { Resource } from './resources/resource.entity';
import { UploadController } from './upload/upload.controller';
import { MessagesModule } from './messages/messages.module';
import { PaymentsController } from './payments/payments.controller';
import { PaymentsService } from './payments/payments.service';
import { PaymentsModule } from './payments/payments.module';




@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
  type: 'postgres',

  // Ensure env variable is read properly
  url: process.env.DATABASE_URL,

  autoLoadEntities: true,

  entities: [User, Video, Understand, Comment, Coach, Session, Resource],

  synchronize: true, // ok for now (later turn off in production)

  // ✅ FIX: Proper SSL handling for Render
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false,

  // ✅ Extra stability (prevents crash loops)
  retryAttempts: 5,
  retryDelay: 3000,
}),

    UsersModule,
    AuthModule,
    StoriesModule,
    VideosModule,
    ProfileModule,
    CommentsModule,
    CoachesModule,
    SessionsModule,
    ResourcesModule,
    MessagesModule,
    PaymentsModule,
  ],
  
controllers: [
  UploadController
],
  
providers: [PaymentsService],

})
export class AppModule {}