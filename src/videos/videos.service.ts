import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';

import {
  InjectRepository,
} from '@nestjs/typeorm';

import {
  Repository,
} from 'typeorm';

import { Video } from './video.entity';

import { User } from '../users/user.entity';

import { Understand } from '../understand/understand.entity';

import { Library } from '../library/library.entity';


@Injectable()
export class VideosService {

  constructor(

    @InjectRepository(Video)
    private readonly videoRepository:
      Repository<Video>,

    @InjectRepository(User)
    private readonly userRepository:
      Repository<User>,

    @InjectRepository(Understand)
    private readonly understandRepository:
      Repository<Understand>,

    @InjectRepository(Library)
    private readonly libraryRepository:
      Repository<Library>,

  ) {}


  // ==========================================
  // CREATE CONTENT
  // ==========================================

  async create(
    dto: any,
    userId: number,
  ) {

    const user =
      await this.userRepository.findOne({
        where: {
          id: userId,
        },
      });


    if (!user) {

      throw new NotFoundException(
        'User not found',
      );

    }


    const video =
      this.videoRepository.create({

        title:
          dto.title,

        context:
          dto.context,

        category:
          dto.category,

        type:
          dto.type,

        videoUrl:
          dto.videoUrl || null,

        fileUrl:
          dto.fileUrl || null,

        coverUrl:
          dto.coverUrl || null,

        price:
          this.normalizePrice(
            dto.price,
          ),

        creator:
          user,

        creatorId:
          userId,

      });


    const savedVideo =
      await this.videoRepository.save(
        video,
      );


    return this.videoRepository.findOne({

      where: {
        id: savedVideo.id,
      },

      relations: [
        'creator',
      ],

    });

  }


  // ==========================================
  // NORMALIZE PRICE
  // ==========================================

  private normalizePrice(
    value: any,
  ): number {

    if (
      value === null ||
      value === undefined ||
      value === ''
    ) {
      return 0;
    }


    const cleaned =
      String(value)
        .replace(/,/g, '')
        .replace(/₦/g, '')
        .trim();


    const number =
      Number(cleaned);


    if (
      Number.isNaN(number)
    ) {
      return 0;
    }


    return number;

  }


  // ==========================================
  // FIND ALL
  // ==========================================

  async findAll(
    page: number = 1,
    limit: number = 10,
  ) {

    page =
      Math.max(
        1,
        Number(page) || 1,
      );


    limit =
      Math.min(
        50,
        Math.max(
          1,
          Number(limit) || 10,
        ),
      );


    const skip =
      (page - 1) * limit;


    const [
      videos,
      total,
    ] =
      await this.videoRepository
        .findAndCount({

          relations: [
            'creator',
            'comments',
            'comments.author',
          ],

          order: {
            createdAt: 'DESC',
            id: 'DESC',
          },

          skip,

          take: limit,

        });


    return {

      data:
        videos.map(
          (v) => ({

            id:
              v.id,

            title:
              v.title,

            category:
              v.category,

            context:
              v.context,

            type:
              v.type,

            videoUrl:
              v.videoUrl,

            fileUrl:
              v.fileUrl,

            coverUrl:
              v.coverUrl,

            price:
              v.price,

            understandCount:
              v.understandCount,

            creatorId:
              v.creatorId,

            creatorUsername:
              v.creator?.username ||
              'User',

            creatorAvatar:
              v.creator?.avatar ||
              null,

            comments:
              v.comments || [],

            createdAt:
              v.createdAt,

          }),
        ),

      total,

      page,

      limit,

      hasMore:
        skip + videos.length < total,

    };

  }


  // ==========================================
  // FIND ONE
  // ==========================================

  async findOne(
    id: number,
  ) {

    const video =
      await this.videoRepository.findOne({

        where: {
          id,
        },

        relations: [
          'creator',
          'comments',
          'comments.author',
        ],

      });


    if (!video) {

      throw new NotFoundException(
        'Content not found',
      );

    }


    return {

      id:
        video.id,

      title:
        video.title,

      category:
        video.category,

      context:
        video.context,

      type:
        video.type,

      videoUrl:
        video.videoUrl,

      fileUrl:
        video.fileUrl,

      coverUrl:
        video.coverUrl,

      price:
        video.price,

      creatorId:
        video.creatorId,

      creatorUsername:
        video.creator?.username,

      creatorAvatar:
        video.creator?.avatar,

      comments:
        video.comments,

      createdAt:
        video.createdAt,

    };

  }


  // ==========================================
  // RELATED
  // ==========================================

  async getRelatedVideos(
    id: number,
  ) {

    const currentVideo =
      await this.videoRepository.findOne({

        where: {
          id,
        },

      });


    if (!currentVideo) {

      throw new NotFoundException(
        'Video not found',
      );

    }


    const related =
      await this.videoRepository

        .createQueryBuilder(
          'video',
        )

        .leftJoinAndSelect(
          'video.creator',
          'creator',
        )

        .where(
          'video.category = :category',
          {
            category:
              currentVideo.category,
          },
        )

        .andWhere(
          'video.id != :id',
          {
            id,
          },
        )

        .orderBy(
          'video.understandCount',
          'DESC',
        )

        .addOrderBy(
          'video.createdAt',
          'DESC',
        )

        .take(10)

        .getMany();


    return related.map(
      (video) => ({

        id:
          video.id,

        title:
          video.title,

        category:
          video.category,

        context:
          video.context,

        type:
          video.type,

        videoUrl:
          video.videoUrl,

        fileUrl:
          video.fileUrl,

        coverUrl:
          video.coverUrl,

        price:
          video.price,

        understandCount:
          video.understandCount,

        creatorId:
          video.creatorId,

        creatorUsername:
          video.creator?.username ||
          'User',

        creatorAvatar:
          video.creator?.avatar ||
          null,

        createdAt:
          video.createdAt,

      }),
    );

  }


  // ==========================================
  // CREATOR CONTENT
  // ==========================================

  async getVideosByCreator(
    creatorId: number,
  ) {

    return this.videoRepository.find({

      where: {
        creatorId,
      },

      relations: [
        'creator',
      ],

      order: {
        createdAt: 'DESC',
      },

    });

  }


  // ==========================================
  // DELETE
  // ==========================================

  async deleteVideo(
    id: number,
    userId: number,
  ) {

    const video =
      await this.videoRepository.findOne({

        where: {
          id,
        },

      });


    if (!video) {

      throw new NotFoundException(
        'Video not found',
      );

    }


    if (
      video.creatorId !== userId
    ) {

      throw new ForbiddenException(
        'You cannot delete this video',
      );

    }


    await this.videoRepository.delete(
      id,
    );


    return {

      message:
        'Video deleted successfully',

    };

  }


  // ==========================================
  // UNDERSTAND
  // ==========================================

  async pressUnderstand(
    videoId: number,
    userId: number,
  ) {

    const video =
      await this.videoRepository.findOne({

        where: {
          id: videoId,
        },

      });


    if (!video) {

      throw new NotFoundException(
        'Video not found',
      );

    }


    const existing =
      await this.understandRepository.findOne({

        where: {

          videoId,

          userId,

        },

      });


    if (existing) {

      return {

        understandCount:
          video.understandCount,

        message:
          'Already understood',

      };

    }


    const understand =
      this.understandRepository.create({

        videoId,

        userId,

      });


    await this.understandRepository.save(
      understand,
    );


    video.understandCount =
      (video.understandCount || 0) + 1;


    await this.videoRepository.save(
      video,
    );


    const creator =
      await this.userRepository.findOne({

        where: {
          id: video.creatorId,
        },

      });


    if (creator) {

      creator.totalUnderstand =
        (creator.totalUnderstand || 0) + 1;


      await this.userRepository.save(
        creator,
      );

    }


    return {

      understandCount:
        video.understandCount,

    };

  }


  // ==========================================
  // SEARCH
  // ==========================================

  async searchVideos(
    query: string,
  ) {

    if (!query) {
      return [];
    }


    const videos =
      await this.videoRepository

        .createQueryBuilder(
          'video',
        )

        .leftJoinAndSelect(
          'video.creator',
          'creator',
        )

        .leftJoinAndSelect(
          'video.comments',
          'comments',
        )

        .where(
          'LOWER(video.title) LIKE LOWER(:query)',
          {
            query:
              `%${query}%`,
          },
        )

        .orWhere(
          'LOWER(video.category) LIKE LOWER(:query)',
          {
            query:
              `%${query}%`,
          },
        )

        .orWhere(
          'LOWER(video.context) LIKE LOWER(:query)',
          {
            query:
              `%${query}%`,
          },
        )

        .orderBy(
          'video.createdAt',
          'DESC',
        )

        .getMany();


    return videos.map(
      (v) => ({

        id:
          v.id,

        title:
          v.title,

        category:
          v.category,

        context:
          v.context,

        type:
          v.type,

        videoUrl:
          v.videoUrl,

        fileUrl:
          v.fileUrl,

        coverUrl:
          v.coverUrl,

        price:
          v.price,

        understandCount:
          v.understandCount,

        creatorId:
          v.creatorId,

        creatorUsername:
          v.creator?.username ||
          'User',

        creatorAvatar:
          v.creator?.avatar ||
          null,

        createdAt:
          v.createdAt,

      }),
    );

  }


  // ==========================================
  // MARKET
  // ==========================================

  async getMarket(
    type?: string,
  ) {

    const query =
      this.videoRepository

        .createQueryBuilder(
          'item',
        )

        .leftJoinAndSelect(
          'item.creator',
          'creator',
        )

        .leftJoinAndSelect(
          'item.comments',
          'comments',
        )

        .orderBy(
          'item.createdAt',
          'DESC',
        );


    if (
      type &&
      type !== 'all'
    ) {

      query.andWhere(
        'item.type = :type',
        {
          type,
        },
      );

    }


    const items =
      await query.getMany();


    return {

      data:
        items.map(
          (item) => ({

            id:
              item.id,

            title:
              item.title,

            context:
              item.context,

            type:
              item.type,

            videoUrl:
              item.videoUrl,

            fileUrl:
              item.fileUrl,

            coverUrl:
              item.coverUrl,

            price:
              item.price,

            creatorId:
              item.creatorId,

            creatorUsername:
              item.creator?.username ||
              'User',

            creatorAvatar:
              item.creator?.avatar ||
              null,

            comments:
              item.comments || [],

            createdAt:
              item.createdAt,

          }),
        ),

    };

  }


  // ==========================================
  // UPDATE CONTENT
  //
  // IMPORTANT:
  // This now expects JSON.
  //
  // Cloudinary media has already been
  // uploaded by the browser.
  // ==========================================

  async updateVideo(
    id: number,
    dto: any,
    userId: number,
  ) {

    const video =
      await this.videoRepository.findOne({

        where: {
          id,
        },

      });


    if (!video) {

      throw new NotFoundException(
        'Content not found',
      );

    }


    if (
      video.creatorId !== userId
    ) {

      throw new ForbiddenException(
        'You cannot edit this content',
      );

    }


    if (
      dto.title !== undefined
    ) {

      video.title =
        String(dto.title).trim();

    }


    if (
      dto.context !== undefined
    ) {

      video.context =
        String(dto.context).trim();

    }


    if (
      dto.category !== undefined
    ) {

      video.category =
        dto.category;

    }


    if (
      dto.type !== undefined
    ) {

      video.type =
        dto.type;

    }


    if (
      dto.videoUrl !== undefined
    ) {

      video.videoUrl =
        dto.videoUrl || null;

    }


    if (
      dto.fileUrl !== undefined
    ) {

      video.fileUrl =
        dto.fileUrl || null;

    }


    if (
      dto.coverUrl !== undefined
    ) {

      video.coverUrl =
        dto.coverUrl || null;

    }


    if (
      dto.price !== undefined
    ) {

      video.price =
        this.normalizePrice(
          dto.price,
        );

    }


    return this.videoRepository.save(
      video,
    );

  }

}