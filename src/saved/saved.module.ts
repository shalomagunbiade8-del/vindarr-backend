import {
  Module,
} from '@nestjs/common';

import {
  TypeOrmModule,
} from '@nestjs/typeorm';

import { Saved } from './saved.entity';
import { SavingStreak } from './saving-streak.entity';
import { CollectionStreak } from './collection-streak.entity';

import { SavedService } from './saved.service';
import { SavedController } from './saved.controller';

import { Video } from '../videos/video.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Saved,
      SavingStreak,
      CollectionStreak,
      Video,
    ]),
  ],

  controllers: [
    SavedController,
  ],

  providers: [
    SavedService,
  ],

  exports: [
    SavedService,
    TypeOrmModule,
  ],
})
export class SavedModule {}