import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Find } from './find.entity';
import { FindReply } from '../find-reply/find-reply.entity';
import { User } from '../users/user.entity';

import { CreateFindDto } from './dto/create-find.dto';
import { CreateFindReplyDto } from '../find-reply/dto/create-find-reply.dto';

@Injectable()
export class FindService {

  constructor(

    @InjectRepository(Find)
    private readonly findRepository:
      Repository<Find>,

    @InjectRepository(FindReply)
    private readonly replyRepository:
      Repository<FindReply>,

    @InjectRepository(User)
    private readonly userRepository:
      Repository<User>,

  ) {}

  // ==========================================
  // CREATE FIND
  // ==========================================

  async create(
    dto: CreateFindDto,
    userId: number,
  ) {

    const creator =
      await this.userRepository.findOne({
        where: {
          id: userId,
        },
      });

    if (!creator) {

      throw new NotFoundException(
        'User not found',
      );

    }

    const find =
      this.findRepository.create({

        caption:
          dto.caption,

        category:
          dto.category,

        location:
          dto.location || null,

        videoUrl:
          dto.videoUrl,

        duration:
          dto.duration || 0,

        creatorId:
          userId,

        creator,

        replyCount:
          0,

      });

    const saved =
      await this.findRepository.save(
        find,
      );

    return this.findOne(
      saved.id,
    );
  }

  // ==========================================
  // GET FIND FEED
  // ==========================================

  async findAll(
    page = 1,
    limit = 15,
  ) {

    page =
      Number(page) || 1;

    limit =
      Number(limit) || 15;

    page =
      Math.max(
        1,
        page,
      );

    limit =
      Math.min(
        Math.max(
          1,
          limit,
        ),
        30,
      );

    const skip =
      (page - 1) * limit;

    const [
      finds,
      total,
    ] =
      await this.findRepository.findAndCount({

        relations: [
          'creator',
          'replies',
          'replies.creator',
        ],

        order: {
          createdAt: 'DESC',
        },

        skip,

        take: limit,

      });

    return {

      data:
        finds.map(
          find =>
            this.serializeFind(
              find,
            ),
        ),

      total,

      page,

      limit,

      hasMore:
        skip + finds.length < total,

    };
  }

  // ==========================================
  // GET SINGLE FIND
  // ==========================================

  async findOne(
    id: number,
  ) {

    const find =
      await this.findRepository.findOne({

        where: {
          id,
        },

        relations: [
          'creator',
          'replies',
          'replies.creator',
        ],

      });

    if (!find) {

      throw new NotFoundException(
        'Find request not found',
      );

    }

    return this.serializeFind(
      find,
    );
  }

  // ==========================================
  // CREATE VIDEO REPLY
  // ==========================================

  async createReply(
    findId: number,
    dto: CreateFindReplyDto,
    userId: number,
  ) {

    const find =
      await this.findRepository.findOne({
        where: {
          id: findId,
        },
      });

    if (!find) {

      throw new NotFoundException(
        'Find request not found',
      );

    }

    const creator =
      await this.userRepository.findOne({
        where: {
          id: userId,
        },
      });

    if (!creator) {

      throw new NotFoundException(
        'User not found',
      );

    }

    const reply =
      this.replyRepository.create({

        findId,

        find,

        creatorId:
          userId,

        creator,

        videoUrl:
          dto.videoUrl,

        duration:
          dto.duration || 0,

      });

    const saved =
      await this.replyRepository.save(
        reply,
      );

    find.replyCount =
      (find.replyCount || 0) + 1;

    await this.findRepository.save(
      find,
    );

    const createdReply =
      await this.replyRepository.findOne({

        where: {
          id: saved.id,
        },

        relations: [
          'creator',
        ],

      });

    if (!createdReply) {

      throw new NotFoundException(
        'Reply could not be created',
      );

    }

    return this.serializeReply(
      createdReply,
    );
  }

  // ==========================================
  // GET REPLIES
  // ==========================================

  async getReplies(
    findId: number,
  ) {

    const find =
      await this.findRepository.findOne({
        where: {
          id: findId,
        },
      });

    if (!find) {

      throw new NotFoundException(
        'Find request not found',
      );

    }

    const replies =
      await this.replyRepository.find({

        where: {
          findId,
        },

        relations: [
          'creator',
        ],

        order: {
          createdAt: 'ASC',
        },

      });

    return replies.map(
      reply =>
        this.serializeReply(
          reply,
        ),
    );
  }

  // ==========================================
  // DELETE FIND
  // ==========================================

  async delete(
    id: number,
    userId: number,
  ) {

    const find =
      await this.findRepository.findOne({
        where: {
          id,
        },
      });

    if (!find) {

      throw new NotFoundException(
        'Find request not found',
      );

    }

    if (
      find.creatorId !== userId
    ) {

      throw new NotFoundException(
        'Find request not found',
      );

    }

    await this.findRepository.delete(
      id,
    );

    return {
      message:
        'Find request deleted successfully',
    };
  }

  // ==========================================
  // DELETE REPLY
  // ==========================================

  async deleteReply(
    replyId: number,
    userId: number,
  ) {

    const reply =
      await this.replyRepository.findOne({
        where: {
          id: replyId,
        },
      });

    if (!reply) {

      throw new NotFoundException(
        'Reply not found',
      );

    }

    if (
      reply.creatorId !== userId
    ) {

      throw new NotFoundException(
        'Reply not found',
      );

    }

    const findId =
      reply.findId;

    await this.replyRepository.delete(
      replyId,
    );

    const find =
      await this.findRepository.findOne({
        where: {
          id: findId,
        },
      });

    if (find) {

      find.replyCount =
        Math.max(
          0,
          (find.replyCount || 0) - 1,
        );

      await this.findRepository.save(
        find,
      );

    }

    return {
      message:
        'Reply deleted successfully',
    };
  }

  // ==========================================
  // SERIALIZE FIND
  // ==========================================

  private serializeFind(
    find: Find,
  ) {

    return {

      id:
        find.id,

      caption:
        find.caption,

      category:
        find.category,

      location:
        find.location,

      videoUrl:
        find.videoUrl,

      duration:
        find.duration,

      creatorId:
        find.creatorId,

      creatorUsername:
        find.creator?.username ||
        'User',

      creatorAvatar:
        find.creator?.avatar ||
        null,

      replyCount:
        find.replyCount || 0,

      createdAt:
        find.createdAt,

      replies:
        (find.replies || []).map(
          reply =>
            this.serializeReply(
              reply,
            ),
        ),

    };
  }

  // ==========================================
  // SERIALIZE REPLY
  // ==========================================

  private serializeReply(
    reply: FindReply,
  ) {

    return {

      id:
        reply.id,

      findId:
        reply.findId,

      videoUrl:
        reply.videoUrl,

      duration:
        reply.duration,

      creatorId:
        reply.creatorId,

      creatorUsername:
        reply.creator?.username ||
        'User',

      creatorAvatar:
        reply.creator?.avatar ||
        null,

      createdAt:
        reply.createdAt,

    };
  }
}