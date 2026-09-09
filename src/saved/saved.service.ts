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
    private readonly savedRepository: Repository<Saved>,

    @InjectRepository(Video)
    private readonly videoRepository: Repository<Video>,

    @InjectRepository(SavingStreak)
    private readonly savingStreakRepository: Repository<SavingStreak>,

    @InjectRepository(CollectionStreak)
    private readonly collectionStreakRepository: Repository<CollectionStreak>,
  ) {}


  /* =======================================================
     SAVE CONTENT
  ======================================================= */

  async saveContent(
    userId: number,
    contentId: number,
  ) {

    const numericContentId = Number(contentId);

    if (!numericContentId || Number.isNaN(numericContentId)) {
      throw new BadRequestException(
        'Content ID is required.',
      );
    }


    const content =
      await this.videoRepository.findOne({
        where: {
          id: numericContentId,
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
          contentId: numericContentId,
        },
        relations: [
          'content',
          'content.creator',
        ],
      });


    if (existing) {

      return {
        data: await this.formatSaved(existing),
        alreadySaved: true,
      };

    }


    const saved =
      this.savedRepository.create({
        userId,
        contentId: numericContentId,
      });


    const savedItem =
      await this.savedRepository.save(saved);


    /*
     * Only a NEW save counts as saving activity.
     * Saving the same item again does not increase the streak.
     */
    await this.updateSavingStreak(userId);


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
          createdAt: 'DESC',
        },
      });


    return {
      data: await Promise.all(
        items.map(
          item => this.formatSaved(item),
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
      data: await this.formatSaved(item),
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


    await this.savedRepository.remove(item);


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
          contentId: Number(contentId),
        },
      });


    return {
      saved: Boolean(item),
      savedId: item?.id || null,
    };

  }


  /* =======================================================
     GET STREAKS
  ======================================================= */

  async getStreaks(
    userId: number,
  ) {

    /*
     * IMPORTANT:
     *
     * We validate the streak here as well as when activity
     * occurs.
     *
     * This means a user does NOT have to perform another
     * action before a missed streak disappears.
     */

    const saving =
      await this.getValidatedSavingStreak(userId);


    const collection =
      await this.getValidatedCollectionStreak(userId);


    return {

      saving: {
        currentStreak:
          saving?.currentStreak || 0,

        longestStreak:
          saving?.longestStreak || 0,

        lastSavedDate:
          saving?.lastSavedDate || null,
      },

      collection: {
        currentStreak:
          collection?.currentStreak || 0,

        longestStreak:
          collection?.longestStreak || 0,

        lastCollectionDate:
          collection?.lastCollectionDate || null,
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


    /*
     * First save ever.
     */

    if (!streak) {

      streak =
        this.savingStreakRepository.create({
          userId,
          currentStreak: 1,
          longestStreak: 1,
          lastSavedDate: today,
        });


      return this.savingStreakRepository.save(
        streak,
      );

    }


    /*
     * Multiple saves on the same calendar day
     * count as ONE day.
     */

    if (
      streak.lastSavedDate === today
    ) {

      return streak;

    }


    const yesterday =
      this.dateMinusDays(
        today,
        1,
      );


    /*
     * Consecutive day.
     */

    if (
      streak.lastSavedDate === yesterday
    ) {

      streak.currentStreak += 1;

    }

    /*
     * One or more missed days.
     *
     * The new save starts a completely new streak.
     */

    else {

      streak.currentStreak = 1;

    }


    streak.lastSavedDate = today;


    streak.longestStreak =
      Math.max(
        Number(streak.longestStreak) || 0,
        streak.currentStreak,
      );


    return this.savingStreakRepository.save(
      streak,
    );

  }


  /* =======================================================
     VALIDATE SAVING STREAK
  ======================================================= */

  private async getValidatedSavingStreak(
    userId: number,
  ) {

    const streak =
      await this.savingStreakRepository.findOne({
        where: {
          userId,
        },
      });


    if (!streak) {
      return null;
    }


    if (!streak.lastSavedDate) {
      return streak;
    }


    const today =
      this.dateOnly();


    const yesterday =
      this.dateMinusDays(
        today,
        1,
      );


    /*
     * Still active today.
     */

    if (
      streak.lastSavedDate === today ||
      streak.lastSavedDate === yesterday
    ) {

      return streak;

    }


    /*
     * User missed at least one full day.
     *
     * IMPORTANT:
     * We set currentStreak to ZERO rather than deleting
     * the record, because longestStreak must be preserved.
     */

    streak.currentStreak = 0;


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
          currentStreak: 1,
          longestStreak: 1,
          lastCollectionDate: today,
        });


      return this.collectionStreakRepository.save(
        streak,
      );

    }


    /*
     * Multiple collection additions on the same day
     * count as one activity day.
     */

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


    streak.lastCollectionDate = today;


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
     VALIDATE COLLECTION STREAK
  ======================================================= */

  private async getValidatedCollectionStreak(
    userId: number,
  ) {

    const streak =
      await this.collectionStreakRepository.findOne({
        where: {
          userId,
        },
      });


    if (!streak) {
      return null;
    }


    if (!streak.lastCollectionDate) {
      return streak;
    }


    const today =
      this.dateOnly();


    const yesterday =
      this.dateMinusDays(
        today,
        1,
      );


    if (
      streak.lastCollectionDate === today ||
      streak.lastCollectionDate === yesterday
    ) {

      return streak;

    }


    /*
     * A collection day was missed.
     */

    streak.currentStreak = 0;


    return this.collectionStreakRepository.save(
      streak,
    );

  }


  /* =======================================================
     FORMAT SAVED
  ======================================================= */

  private async formatSaved(
    item: Saved,
  ) {

    const content =
      item.content;


    return {

      id: item.id,

      contentId: item.contentId,

      createdAt: item.createdAt,

      type: content?.type,

      content: content
        ? {

            id: content.id,

            title: content.title,

            context: content.context,

            category: content.category,

            type: content.type,

            videoUrl: content.videoUrl,

            fileUrl: content.fileUrl,

            coverUrl: content.coverUrl,

            price: content.price,

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
     DATE ONLY
  ======================================================= */

  private dateOnly(): string {

    /*
     * UTC makes the date calculation deterministic across
     * Render instances.
     *
     * If Vindarr later stores each user's timezone,
     * this can be changed to use the user's timezone.
     */

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

}