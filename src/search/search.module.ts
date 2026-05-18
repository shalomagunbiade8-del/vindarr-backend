import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SearchController } from './search.controller';
import { SearchService } from './search.service';

import { User } from '../users/user.entity';
import { Video } from '../videos/video.entity';
import { Story } from '../stories/story.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Video,
      Story
    ])
  ],

  controllers: [SearchController],

  providers: [SearchService],
})
export class SearchModule {}