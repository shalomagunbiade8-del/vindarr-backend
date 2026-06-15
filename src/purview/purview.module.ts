import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Purview } from './purview.entity';
import { User } from '../users/user.entity';
import { Video } from '../videos/video.entity';

import { PurviewController } from './purview.controller';
import { PurviewService } from './purview.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Purview,
      User,
      Video,
    ]),
  ],

  controllers: [
    PurviewController,
  ],

  providers: [
    PurviewService,
  ],
})
export class PurviewModule {}