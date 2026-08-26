import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';

import {
  InjectRepository,
} from '@nestjs/typeorm';

import {
  Repository,
  In,
} from 'typeorm';

import { Collection } from './collection.entity';
import { CollectionItem } from './collection-item.entity';
import { Saved } from '../saved/saved.entity';
import { CollectionStreak } from './collection-streak.entity';


@Injectable()
export class CollectionsService {

  constructor(

    @InjectRepository(Collection)
    private readonly collectionRepository:
      Repository<Collection>,

    @InjectRepository(CollectionItem)
    private readonly collectionItemRepository:
      Repository<CollectionItem>,

    @InjectRepository(Saved)
    private readonly savedRepository:
      Repository<Saved>,

    @InjectRepository(CollectionStreak)
    private readonly collectionStreakRepository:
      Repository<CollectionStreak>,

  ) {}


  /* =======================================================
     CREATE
  ======================================================= */

  async create(
    userId: number,
    name: string,
  ) {

    const cleanName =
      String(
        name || '',
      ).trim();


    if (!cleanName) {

      throw new BadRequestException(
        'Collection name is required.',
      );

    }


    const collection =
      this.collectionRepository.create({

        userId,

        name:
          cleanName,

        coverUrl:
          null,

      });


    const saved =
      await this.collectionRepository.save(
        collection,
      );


    return {
      data: {

        ...saved,

        itemCount:
          0,

        items:
          [],

      },

    };

  }


  /* =======================================================
     GET ALL
  ======================================================= */

  async findAll(
    userId: number,
  ) {

    const collections =
      await this.collectionRepository.find({

        where: {
          userId,
        },

        relations: [
          'items',
          'items.savedItem',
          'items.savedItem.content',
        ],

        order: {
          updatedAt:
            'DESC',
        },

      });


    return {

      data:
        collections.map(
          collection =>
            this.formatCollection(
              collection,
            ),
        ),

    };

  }


  /* =======================================================
     GET ONE
  ======================================================= */

  async findOne(
    userId: number,
    collectionId: number,
  ) {

    const collection =
      await this.collectionRepository.findOne({

        where: {
          id:
            collectionId,

          userId,
        },

        relations: [

          'items',

          'items.savedItem',

          'items.savedItem.content',

          'items.savedItem.content.creator',

        ],

      });


    if (!collection) {

      throw new NotFoundException(
        'Collection not found.',
      );

    }


    collection.items =
      collection.items.sort(
        (a,b) =>
          a.position -
          b.position,
      );


    return {

      data:
        this.formatCollection(
          collection,
        ),

    };

  }


  /* =======================================================
     ADD ITEM
  ======================================================= */

  async addItem(
    userId: number,
    collectionId: number,
    savedItemId: number,
  ) {

    const collection =
      await this.collectionRepository.findOne({

        where: {
          id:
            collectionId,

          userId,
        },

        relations: [
          'items',
        ],

      });


    if (!collection) {

      throw new NotFoundException(
        'Collection not found.',
      );

    }


    const saved =
      await this.savedRepository.findOne({

        where: {
          id:
            savedItemId,

          userId,
        },

      });


    if (!saved) {

      throw new NotFoundException(
        'Saved item not found.',
      );

    }


    const existing =
      await this.collectionItemRepository.findOne({

        where: {

          collectionId,

          savedItemId,

        },

      });


    if (existing) {

      return {

        data:
          existing,

        alreadyAdded:
          true,

      };

    }


    const max =
      collection.items?.length
        ? Math.max(
            ...collection.items.map(
              item =>
                Number(
                  item.position,
                ),
            ),
          )
        : -1;


    const item =
      this.collectionItemRepository.create({

        collectionId,

        savedItemId,

        position:
          max + 1,

      });


    const result =
      await this.collectionItemRepository.save(
        item,
      );


    await this.updateCollectionCover(
      collectionId,
      savedItemId,
    );


    await this.touchCollection(
      collectionId,
    );


    await this.updateCollectionStreak(
      userId,
    );


    return {

      data:
        result,

      alreadyAdded:
        false,

    };

  }


  /* =======================================================
     REMOVE ITEM
  ======================================================= */

  async removeItem(
    userId: number,
    collectionItemId: number,
  ) {

    const item =
      await this.collectionItemRepository.findOne({

        where: {
          id:
            collectionItemId,
        },

        relations: [
          'collection',
        ],

      });


    if (!item) {

      throw new NotFoundException(
        'Collection item not found.',
      );

    }


    if (
      item.collection.userId !==
      userId
    ) {

      throw new ForbiddenException(
        'You cannot modify this collection.',
      );

    }


    await this.collectionItemRepository.remove(
      item,
    );


    await this.touchCollection(
      item.collectionId,
    );


    return {
      message:
        'Removed from collection.',
    };

  }


  /* =======================================================
     REORDER
  ======================================================= */

  async reorder(
    userId: number,
    collectionId: number,
    itemIds: number[],
  ) {

    if (
      !Array.isArray(itemIds)
    ) {

      throw new BadRequestException(
        'itemIds must be an array.',
      );

    }


    const collection =
      await this.collectionRepository.findOne({

        where: {
          id:
            collectionId,

          userId,
        },

      });


    if (!collection) {

      throw new NotFoundException(
        'Collection not found.',
      );

    }


    const items =
      await this.collectionItemRepository.find({

        where: {
          collectionId,
        },

      });


    const existingIds =
      new Set(
        items.map(
          item =>
            Number(item.id),
        ),
      );


    const incomingIds =
      itemIds.map(
        id =>
          Number(id),
      );


    for (
      const id of incomingIds
    ) {

      if (
        !existingIds.has(id)
      ) {

        throw new BadRequestException(
          'Invalid collection item.',
        );

      }

    }


    for (
      let index = 0;
      index < incomingIds.length;
      index++
    ) {

      await this.collectionItemRepository.update(

        {
          id:
            incomingIds[index],

          collectionId,

        },

        {
          position:
            index,
        },

      );

    }


    await this.touchCollection(
      collectionId,
    );


    return {
      message:
        'Collection reordered.',
    };

  }


  /* =======================================================
     DELETE COLLECTION
  ======================================================= */

  async removeCollection(
    userId: number,
    collectionId: number,
  ) {

    const collection =
      await this.collectionRepository.findOne({

        where: {
          id:
            collectionId,

          userId,
        },

      });


    if (!collection) {

      throw new NotFoundException(
        'Collection not found.',
      );

    }


    await this.collectionRepository.remove(
      collection,
    );


    return {
      message:
        'Collection deleted.',
    };

  }


  /* =======================================================
     STREAK
  ======================================================= */

  async updateCollectionStreak(
    userId: number,
  ) {

    const today =
      this.dateOnly();


    let streak =
      await this.collectionStreakRepository.findOne({

        where: {
          userId,
        },

      });


    if (!streak) {

      streak =
        this.collectionStreakRepository.create({

          userId,

          currentStreak:
            1,

          longestStreak:
            1,

          lastCollectionDate:
            today,

        });


      return this.collectionStreakRepository.save(
        streak,
      );

    }


    if (
      streak.lastCollectionDate ===
      today
    ) {

      return streak;

    }


    const yesterday =
      this.dateMinusDays(
        today,
        1,
      );


    if (
      streak.lastCollectionDate ===
      yesterday
    ) {

      streak.currentStreak +=
        1;

    }
    else {

      streak.currentStreak =
        1;

    }


    streak.lastCollectionDate =
      today;


    streak.longestStreak =
      Math.max(
        streak.longestStreak,
        streak.currentStreak,
      );


    return this.collectionStreakRepository.save(
      streak,
    );

  }


  /* =======================================================
     FORMAT COLLECTION
  ======================================================= */

  private formatCollection(
    collection: Collection,
  ) {

    const items =
      (
        collection.items ||
        []
      ).sort(
        (a,b) =>
          a.position -
          b.position,
      );


    return {

      id:
        collection.id,

      userId:
        collection.userId,

      name:
        collection.name,

      coverUrl:
        collection.coverUrl,

      itemCount:
        items.length,

      items:
        items.map(
          item => ({

            id:
              item.id,

            position:
              item.position,

            savedItem:
              item.savedItem
                ? {

                    id:
                      item.savedItem.id,

                    contentId:
                      item.savedItem.contentId,

                    content:
                      item.savedItem.content
                        ? {

                            id:
                              item.savedItem.content.id,

                            title:
                              item.savedItem.content.title,

                            type:
                              item.savedItem.content.type,

                            videoUrl:
                              item.savedItem.content.videoUrl,

                            fileUrl:
                              item.savedItem.content.fileUrl,

                            coverUrl:
                              item.savedItem.content.coverUrl,

                            price:
                              item.savedItem.content.price,

                          }

                        : null,

                  }

                : null,

          }),
        ),

    };

  }


  /* =======================================================
     COVER
  ======================================================= */

  private async updateCollectionCover(
    collectionId: number,
    savedItemId: number,
  ) {

    const collection =
      await this.collectionRepository.findOne({

        where: {
          id:
            collectionId,
        },

      });


    if (!collection) {

      return;

    }


    const saved =
      await this.savedRepository.findOne({

        where: {
          id:
            savedItemId,
        },

        relations: [
          'content',
        ],

      });


    if (!saved) {

      return;

    }


    const content =
      saved.content;


    if (!content) {

      return;

    }


    collection.coverUrl =
      content.coverUrl ||
      content.videoUrl ||
      content.fileUrl ||
      null;


    await this.collectionRepository.save(
      collection,
    );

  }


  /* =======================================================
     TOUCH
  ======================================================= */

  private async touchCollection(
    collectionId: number,
  ) {

    await this.collectionRepository.update(

      {
        id:
          collectionId,
      },

      {
        updatedAt:
          new Date(),
      },

    );

  }


  /* =======================================================
     DATE
  ======================================================= */

  private dateOnly(): string {

    const now =
      new Date();


    return [
      now.getFullYear(),
      String(
        now.getMonth() + 1,
      ).padStart(2, '0'),
      String(
        now.getDate(),
      ).padStart(2, '0'),
    ].join('-');

  }


  private dateMinusDays(
    date: string,
    days: number,
  ): string {

    const d =
      new Date(
        `${date}T00:00:00`,
      );


    d.setDate(
      d.getDate() -
      days,
    );


    return [
      d.getFullYear(),
      String(
        d.getMonth() + 1,
      ).padStart(2, '0'),
      String(
        d.getDate(),
      ).padStart(2, '0'),
    ].join('-');

  }

}