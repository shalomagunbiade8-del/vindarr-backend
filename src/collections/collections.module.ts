import {
  Module,
} from '@nestjs/common';

import {
  TypeOrmModule,
} from '@nestjs/typeorm';

import { Collection } from './collection.entity';
import { CollectionItem } from './collection-item.entity';
import { Saved } from '../saved/saved.entity';
import { CollectionStreak } from './collection-streak.entity';

import { CollectionsController } from './collections.controller';
import { CollectionsService } from './collections.service';


@Module({

  imports: [

    TypeOrmModule.forFeature([

      Collection,

      CollectionItem,

      Saved,

      CollectionStreak,
    ]),

  ],

  controllers: [

    CollectionsController,

  ],

  providers: [

    CollectionsService,

  ],

  exports: [

    CollectionsService,

  ],

})
export class CollectionsModule {}