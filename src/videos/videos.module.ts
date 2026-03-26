import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { VideosService } from './videos.service';
import { VideosController } from './videos.controller';
import { Video } from './video.entity';
import { User } from '../users/user.entity';
import { Understand } from '../understand/understand.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Video, User, Understand])],
  controllers: [VideosController],
  providers: [VideosService],
})
export class VideosModule {}

