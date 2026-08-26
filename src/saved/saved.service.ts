import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import {
  InjectRepository,
} from '@nestjs/typeorm';

import {
  Repository,
} from 'typeorm';

import { Saved } from './saved.entity';
import { Video } from '../videos/video.entity';
import { SavingStreak } from './saving-streak.entity';
import { CollectionStreak } from './collection-streak.entity';


@Injectable()
export class SavedService {

  constructor(

    @InjectRepository(Saved)
    private readonly savedRepository:
      Repository<Saved>,

    @InjectRepository(Video)
    private readonly videoRepository:
      Repository<Video>,

    @InjectRepository(SavingStreak)
    private readonly savingStreakRepository:
      Repository<SavingStreak>,

    @InjectRepository(CollectionStreak)
    private readonly collectionStreakRepository:
      Repository<CollectionStreak>,

  ) {}


  /* =======================================================
     SAVE CONTENT
  ======================================================= */

  async saveContent(
    userId: number,
    contentId: number,
  ) {

    if (!contentId) {

      throw new BadRequestException(
        'Content ID is required.',
      );

    }


    const content =
      await this.videoRepository.findOne({
        where: {
          id: Number(contentId),
        },

      });


    if (!content) {

      throw new NotFoundException(
        'Content not found.',
      );

    }


    const existing =
      await this.savedRepository.findOne({
        where: {
          userId,
          contentId:
            Number(contentId),
        },
      });


    if (existing) {

      return {
        data:
          await this.formatSaved(
            existing,
          ),

        alreadySaved:
          true,

      };

    }


    const saved =
      this.savedRepository.create({

        userId,

        contentId:
          Number(contentId),

      });


    const savedItem =
      await this.savedRepository.save(
        saved,
      );


    await this.updateSavingStreak(
      userId,
    );


    const complete =
  await this.savedRepository.findOne({
    where: {
      id: savedItem.id,
    },
    relations: [
      'content',
      'content.creator',
    ],
  });

if (!complete) {
  throw new NotFoundException(
    'Saved item could not be loaded after saving.',
  );
}

return {
  data: await this.formatSaved(complete),
  alreadySaved: false,
};

  }


  /* =======================================================
     GET SAVED
  ======================================================= */

  async getSaved(
    userId: number,
  ) {

    const items =
      await this.savedRepository.find({

        where: {
          userId,
        },

        relations: [
          'content',
          'content.creator',
        ],

        order: {
          createdAt:
            'DESC',
        },

      });


    return {

      data:
        await Promise.all(
          items.map(
            item =>
              this.formatSaved(
                item,
              ),
          ),
        ),

    };

  }


  /* =======================================================
     GET ONE
  ======================================================= */

  async getOne(
    userId: number,
    id: number,
  ) {

    const item =
      await this.savedRepository.findOne({

        where: {
          id,
          userId,
        },

        relations: [
          'content',
          'content.creator',
        ],

      });


    if (!item) {

      throw new NotFoundException(
        'Saved item not found.',
      );

    }


    return {
      data:
        await this.formatSaved(
          item,
        ),
    };

  }


  /* =======================================================
     REMOVE
  ======================================================= */

  async removeSaved(
    userId: number,
    id: number,
  ) {

    const item =
      await this.savedRepository.findOne({

        where: {
          id,
          userId,
        },

      });


    if (!item) {

      throw new NotFoundException(
        'Saved item not found.',
      );

    }


    await this.savedRepository.remove(
      item,
    );


    return {
  message: 'Removed from saved.',
  saved: false,
  contentId: item.contentId,
};

  }


  /* =======================================================
     CHECK SAVED
  ======================================================= */

  async isSaved(
    userId: number,
    contentId: number,
  ) {

    const item =
      await this.savedRepository.findOne({

        where: {
          userId,
          contentId,
        },

      });


    return {
      saved:
        Boolean(item),

      savedId:
        item?.id || null,

    };

  }


  /* =======================================================
     STREAKS
  ======================================================= */

  async getStreaks(
    userId: number,
  ) {

    const saving =
      await this.savingStreakRepository.findOne({

        where: {
          userId,
        },

      });


    const collection =
      await this.collectionStreakRepository.findOne({

        where: {
          userId,
        },

      });


    return {

      saving: {

        currentStreak:
          saving?.currentStreak ||
          0,

        longestStreak:
          saving?.longestStreak ||
          0,

        lastSavedDate:
          saving?.lastSavedDate ||
          null,

      },

      collection: {

        currentStreak:
          collection?.currentStreak ||
          0,

        longestStreak:
          collection?.longestStreak ||
          0,

        lastCollectionDate:
          collection?.lastCollectionDate ||
          null,

      },

    };

  }


  /* =======================================================
     SAVING STREAK
  ======================================================= */

  async updateSavingStreak(
    userId: number,
  ) {

    const today =
      this.dateOnly();


    let streak =
      await this.savingStreakRepository.findOne({

        where: {
          userId,
        },

      });


    if (!streak) {

      streak =
        this.savingStreakRepository.create({

          userId,

          currentStreak:
            1,

          longestStreak:
            1,

          lastSavedDate:
            today,

        });


      await this.savingStreakRepository.save(
        streak,
      );

      return streak;

    }


    if (
      streak.lastSavedDate ===
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
      streak.lastSavedDate ===
      yesterday
    ) {

      streak.currentStreak += 1;

    }
    else {

      streak.currentStreak =
        1;

    }


    streak.lastSavedDate =
      today;


    streak.longestStreak =
      Math.max(
        streak.longestStreak,
        streak.currentStreak,
      );


    return this.savingStreakRepository.save(
      streak,
    );

  }


  /* =======================================================
     COLLECTION STREAK
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

      streak.currentStreak += 1;

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
     FORMAT
  ======================================================= */

  private async formatSaved(
    item: Saved,
  ) {

    const content =
      item.content;


    return {

      id:
        item.id,

      contentId:
        item.contentId,

      createdAt:
        item.createdAt,

      type:
        content?.type,

      content: content
        ? {

            id:
              content.id,

            title:
              content.title,

            context:
              content.context,

            category:
              content.category,

            type:
              content.type,

            videoUrl:
              content.videoUrl,

            fileUrl:
              content.fileUrl,

            coverUrl:
              content.coverUrl,

            price:
              content.price,

            understandCount:
              content.understandCount,

            creatorId:
              content.creatorId,

            creatorUsername:
              content.creator?.username ||
              'User',

            creatorAvatar:
              content.creator?.avatar ||
              null,

            createdAt:
              content.createdAt,

          }

        : null,

    };

  }


  /* =======================================================
     DATE HELPERS
  ======================================================= */

  private dateOnly(): string {

    const now =
      new Date();


    return [
      now.getFullYear(),
      String(
        now.getMonth() + 1
      ).padStart(2, '0'),
      String(
        now.getDate()
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
      d.getDate() - days,
    );


    return [
      d.getFullYear(),
      String(
        d.getMonth() + 1
      ).padStart(2, '0'),
      String(
        d.getDate()
      ).padStart(2, '0'),
    ].join('-');

  }

}