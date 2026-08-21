import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { Library } from './library.entity';

import { Video } from '../videos/video.entity';

import { LibraryService } from './library.service';
import { LibraryController } from './library.controller';

@Module({

  imports: [

    TypeOrmModule.forFeature([
      Library,
      Video,
    ]),

  ],

  providers: [
    LibraryService,
  ],

  controllers: [
    LibraryController,
  ],

  exports: [
    LibraryService,
  ],

})

export class LibraryModule {}
