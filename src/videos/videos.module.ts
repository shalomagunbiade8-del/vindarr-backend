import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { VideosController } from './videos.controller';
import { VideosService } from './videos.service';

import { Video } from './video.entity';
import { User } from '../users/user.entity';
import { Understand } from '../understand/understand.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Video,
      User,
      Understand,
    ]),
  ],

  controllers: [VideosController],

  providers: [VideosService],

  exports: [VideosService],
})
export class VideosModule {}