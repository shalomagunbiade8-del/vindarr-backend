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
} from 'typeorm';

import { randomBytes } from 'crypto';

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
      String(name || '').trim();


    if (!cleanName) {
      throw new BadRequestException(
        'Collection name is required.',
      );
    }


    if (cleanName.length > 80) {
      throw new BadRequestException(
        'Collection name must be 80 characters or less.',
      );
    }


    const shareToken =
      this.generateShareToken();


    const collection =
      this.collectionRepository.create({
        userId,
        name: cleanName,
        coverUrl: null,
        shareToken,
      });


    const saved =
      await this.collectionRepository.save(
        collection,
      );


    return {
      data: {
        ...saved,
        itemCount: 0,
        items: [],
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
          updatedAt: 'DESC',
        },

      });


    return {
      data: collections.map(
        collection =>
          this.formatCollection(collection),
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
          id: collectionId,
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
      (collection.items || []).sort(
        (a, b) =>
          Number(a.position) -
          Number(b.position),
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

    const numericCollectionId =
      Number(collectionId);

    const numericSavedItemId =
      Number(savedItemId);


    if (
      !numericCollectionId ||
      !numericSavedItemId
    ) {
      throw new BadRequestException(
        'Invalid collection or saved item.',
      );
    }


    const collection =
      await this.collectionRepository.findOne({

        where: {
          id: numericCollectionId,
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
          id: numericSavedItemId,
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
          collectionId:
            numericCollectionId,

          savedItemId:
            numericSavedItemId,
        },

      });


    /*
     * Do NOT update the streak if this item was already
     * inside the collection.
     */

    if (existing) {

      return {
        data: existing,
        alreadyAdded: true,
      };

    }


    const positions =
      (collection.items || []).map(
        item =>
          Number(item.position),
      );


    const maxPosition =
      positions.length
        ? Math.max(...positions)
        : -1;


    const item =
      this.collectionItemRepository.create({

        collectionId:
          numericCollectionId,

        savedItemId:
          numericSavedItemId,

        position:
          maxPosition + 1,

      });


    const result =
      await this.collectionItemRepository.save(
        item,
      );


    await this.updateCollectionCover(
      numericCollectionId,
      numericSavedItemId,
    );


    await this.touchCollection(
      numericCollectionId,
    );


    /*
     * THIS is the collection activity.
     *
     * Opening, viewing, removing, or reordering does
     * not count as collection activity.
     */

    await this.updateCollectionStreak(
      userId,
    );


    return {
      data: result,
      alreadyAdded: false,
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
          id: Number(collectionItemId),
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
      item.collection.userId !== userId
    ) {
      throw new ForbiddenException(
        'You cannot modify this collection.',
      );
    }


    await this.collectionItemRepository.remove(
      item,
    );


    /*
     * Recalculate positions after removal.
     */

    const remaining =
      await this.collectionItemRepository.find({

        where: {
          collectionId:
            item.collectionId,
        },

        order: {
          position: 'ASC',
        },

      });


    for (
      let index = 0;
      index < remaining.length;
      index++
    ) {

      if (
        remaining[index].position !== index
      ) {

        await this.collectionItemRepository.update(

          {
            id:
              remaining[index].id,
          },

          {
            position:
              index,
          },

        );

      }

    }


    await this.rebuildCollectionCover(
      item.collectionId,
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

    if (!Array.isArray(itemIds)) {
      throw new BadRequestException(
        'itemIds must be an array.',
      );
    }


    const collection =
      await this.collectionRepository.findOne({

        where: {
          id: Number(collectionId),
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
          collectionId:
            Number(collectionId),
        },

      });


    const incomingIds =
      itemIds.map(
        id => Number(id),
      );


    const existingIds =
      items.map(
        item => Number(item.id),
      );


    /*
     * The frontend must send EVERY item.
     */

    if (
      incomingIds.length !==
      existingIds.length
    ) {

      throw new BadRequestException(
        'All collection items must be included when reordering.',
      );

    }


    const uniqueIncoming =
      new Set(incomingIds);


    if (
      uniqueIncoming.size !==
      existingIds.length
    ) {

      throw new BadRequestException(
        'Duplicate collection item IDs are not allowed.',
      );

    }


    for (
      const id of incomingIds
    ) {

      if (!existingIds.includes(id)) {

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

          collectionId:
            Number(collectionId),
        },

        {
          position:
            index,
        },

      );

    }


    await this.touchCollection(
      Number(collectionId),
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
          id: Number(collectionId),
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
     GET / VALIDATE COLLECTION STREAK
  ======================================================= */

  async getCollectionStreak(
    userId: number,
  ) {

    const streak =
      await this.collectionStreakRepository.findOne({

        where: {
          userId,
        },

      });


    if (!streak) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        lastCollectionDate: null,
      };
    }


    const today =
      this.dateOnly();


    const yesterday =
      this.dateMinusDays(
        today,
        1,
      );


    if (
      streak.lastCollectionDate !== today &&
      streak.lastCollectionDate !== yesterday
    ) {

      streak.currentStreak = 0;

      await this.collectionStreakRepository.save(
        streak,
      );

    }


    return {
      currentStreak:
        streak.currentStreak || 0,

      longestStreak:
        streak.longestStreak || 0,

      lastCollectionDate:
        streak.lastCollectionDate || null,
    };

  }


  /* =======================================================
     UPDATE COLLECTION STREAK
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
      streak.lastCollectionDate === today
    ) {

      return streak;

    }


    const yesterday =
      this.dateMinusDays(
        today,
        1,
      );


    if (
      streak.lastCollectionDate === yesterday
    ) {

      streak.currentStreak += 1;

    }

    else {

      streak.currentStreak = 1;

    }


    streak.lastCollectionDate =
      today;


    streak.longestStreak =
      Math.max(
        Number(streak.longestStreak) || 0,
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
      [...(
        collection.items || []
      )].sort(
        (a, b) =>
          Number(a.position) -
          Number(b.position),
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

      shareToken:
        collection.shareToken || null,

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
     COLLECTION COVER
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


    if (!saved?.content) {
      return;
    }


    const content =
      saved.content;


    collection.coverUrl =
      content.coverUrl ||
      content.videoUrl ||
      null;


    await this.collectionRepository.save(
      collection,
    );

  }


  /* =======================================================
     REBUILD COVER
  ======================================================= */

  private async rebuildCollectionCover(
    collectionId: number,
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


    const firstItem =
      await this.collectionItemRepository.findOne({

        where: {
          collectionId,
        },

        order: {
          position: 'ASC',
        },

        relations: [
          'savedItem',
          'savedItem.content',
        ],

      });


    if (!firstItem?.savedItem?.content) {

      collection.coverUrl = null;

      await this.collectionRepository.save(
        collection,
      );

      return;

    }


    const content =
      firstItem.savedItem.content;


    collection.coverUrl =
      content.coverUrl ||
      content.videoUrl ||
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
     SHARE TOKEN
  ======================================================= */

  private generateShareToken(): string {

    return randomBytes(24).toString('hex');

  }


  /* =======================================================
     DATE
  ======================================================= */

  private dateOnly(): string {

    const now =
      new Date();


    return [
      now.getUTCFullYear(),

      String(
        now.getUTCMonth() + 1,
      ).padStart(2, '0'),

      String(
        now.getUTCDate(),
      ).padStart(2, '0'),

    ].join('-');

  }


  /* =======================================================
     DATE MINUS DAYS
  ======================================================= */

  private dateMinusDays(
    date: string,
    days: number,
  ): string {

    const d =
      new Date(
        `${date}T00:00:00Z`,
      );


    d.setUTCDate(
      d.getUTCDate() - days,
    );


    return [
      d.getUTCFullYear(),

      String(
        d.getUTCMonth() + 1,
      ).padStart(2, '0'),

      String(
        d.getUTCDate(),
      ).padStart(2, '0'),

    ].join('-');

  }


  /* =======================================================
   FIND SHARED COLLECTION
======================================================= */

async findShared(
  shareToken: string,
) {

  const cleanToken =
    String(
      shareToken || '',
    ).trim();


  if (!cleanToken) {

    throw new BadRequestException(
      'Share token is required.',
    );

  }


  const collection =
    await this.collectionRepository.findOne({

      where: {
        shareToken: cleanToken,
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
      'Shared collection not found.',
    );

  }


  collection.items =
    (collection.items || []).sort(
      (a, b) =>
        Number(a.position) -
        Number(b.position),
    );


  /*
   * Public response deliberately does NOT expose
   * the owner's private collection controls.
   */

  return {
    data: {
      id: collection.id,

      name: collection.name,

      coverUrl:
        collection.coverUrl,

      itemCount:
        collection.items?.length || 0,

      items:
        (collection.items || []).map(
          item => ({

            id: item.id,

            position:
              item.position,

            savedItem:
              item.savedItem
                ? {

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

                            creatorUsername:
                              item.savedItem.content.creator
                                ?.username ||
                              'User',

                          }

                        : null,

                  }

                : null,

          }),
        ),

    },

  };

}

}