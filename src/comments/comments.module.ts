import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { Comment } from './comment.entity';

import { CommentsService } from './comments.service';

import { CommentsController } from './comments.controller';

import { Video } from '../videos/video.entity';

import { Story } from '../stories/story.entity';

import { User } from '../users/user.entity';

@Module({

  imports: [

    TypeOrmModule.forFeature([
      Comment,
      Video,
      Story,
      User,
    ]),

  ],

  controllers: [
    CommentsController,
  ],

  providers: [
    CommentsService,
  ],

  exports: [
    CommentsService,
  ],

})
export class CommentsModule {}