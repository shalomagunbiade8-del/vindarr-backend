import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Comment } from './comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';

import { User } from '../users/user.entity';


@Injectable()
export class CommentsService {

  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository:
      Repository<Comment>,
  ) {}


  // =====================================
  // CREATE COMMENT / REPLY
  // =====================================

  async create(
    dto: CreateCommentDto,
    user: User,
  ) {

    // =====================================
    // TEXT VALIDATION
    // =====================================

    const text =
      String(dto.text || '').trim();


    if (!text) {

      throw new BadRequestException(
        'Comment text is required',
      );

    }


    // =====================================
    // TARGET VALIDATION
    // =====================================

    const hasVideo =
      dto.videoId !== undefined &&
      dto.videoId !== null;


    const hasStory =
      dto.storyId !== undefined &&
      dto.storyId !== null;


    if (!hasVideo && !hasStory) {

      throw new BadRequestException(
        'A videoId or storyId is required',
      );

    }


    // A comment cannot belong to both
    // a video and a story.

    if (hasVideo && hasStory) {

      throw new BadRequestException(
        'A comment cannot belong to both a video and a story',
      );

    }


    // =====================================
    // NORMALIZE VIDEO ID
    // =====================================

    let videoId: number | undefined;


    if (hasVideo) {

      videoId =
        Number(dto.videoId);


      if (
        !Number.isInteger(videoId) ||
        videoId <= 0
      ) {

        throw new BadRequestException(
          'Invalid videoId',
        );

      }

    }


    // =====================================
    // NORMALIZE STORY ID
    // =====================================

    let storyId: number | undefined;


    if (hasStory) {

      storyId =
        Number(dto.storyId);


      if (
        !Number.isInteger(storyId) ||
        storyId <= 0
      ) {

        throw new BadRequestException(
          'Invalid storyId',
        );

      }

    }


    // =====================================
    // PARENT COMMENT VALIDATION
    // =====================================

    let parentId:
      number | null = null;


    if (
      dto.parentId !== undefined &&
      dto.parentId !== null
    ) {

      parentId =
        Number(dto.parentId);


      if (
        !Number.isInteger(parentId) ||
        parentId <= 0
      ) {

        throw new BadRequestException(
          'Invalid parentId',
        );

      }


      const parent =
        await this.commentRepository.findOne({

          where: {
            id: parentId,
          },

          relations: [
            'video',
            'story',
          ],

        });


      if (!parent) {

        throw new NotFoundException(
          'Parent comment not found',
        );

      }


      // ===================================
      // VIDEO REPLY VALIDATION
      // ===================================

      if (hasVideo) {

        // Because hasVideo is true,
        // videoId has been validated above.

        if (
          videoId === undefined ||
          !parent.video ||
          Number(parent.video.id) !==
            videoId
        ) {

          throw new BadRequestException(
            'Parent comment does not belong to this video',
          );

        }

      }


      // ===================================
      // STORY REPLY VALIDATION
      // ===================================

      if (hasStory) {

        // Because hasStory is true,
        // storyId has been validated above.

        if (
          storyId === undefined ||
          !parent.story ||
          Number(parent.story.id) !==
            storyId
        ) {

          throw new BadRequestException(
            'Parent comment does not belong to this story',
          );

        }

      }

    }


    // =====================================
    // COMMENT TIME
    // =====================================

    const time =
      dto.time === undefined ||
      dto.time === null
        ? 0
        : Number(dto.time);


    if (
      !Number.isFinite(time) ||
      time < 0
    ) {

      throw new BadRequestException(
        'Invalid comment time',
      );

    }


    // =====================================
    // INSERT COMMENT
    // =====================================
    //
    // IMPORTANT:
    //
    // We deliberately do NOT use:
    //
    //   commentRepository.save()
    //
    // for creating the comment.
    //
    // This performs a direct INSERT and avoids
    // TypeORM's persistence/update graph.
    // =====================================

    const insertData: any = {

      text,

      time,

      parentId,

      author: {
        id: Number(user.id),
      },

    };


    // =====================================
    // VIDEO RELATION
    // =====================================

    if (videoId !== undefined) {

      insertData.video = {
        id: videoId,
      };

    }


    // =====================================
    // STORY RELATION
    // =====================================

    if (storyId !== undefined) {

      insertData.story = {
        id: storyId,
      };

    }


    const insertResult =
      await this.commentRepository
        .createQueryBuilder()
        .insert()
        .into(Comment)
        .values(insertData)
        .returning([
          'id',
        ])
        .execute();


    // =====================================
    // GET INSERTED ID
    // =====================================

    const insertedId =
      insertResult.identifiers?.[0]?.id ||
      insertResult.raw?.[0]?.id;


    if (!insertedId) {

      throw new BadRequestException(
        'Comment could not be created',
      );

    }


    // =====================================
    // RETURN CREATED COMMENT
    // =====================================

    const result =
      await this.commentRepository.findOne({

        where: {
          id: Number(insertedId),
        },

        relations: [
          'author',
          'video',
          'story',
        ],

      });


    if (!result) {

      throw new NotFoundException(
        'Created comment could not be found',
      );

    }


    return result;

  }


  // =====================================
  // GET VIDEO COMMENTS
  // =====================================

  async getVideoComments(
    videoId: number,
  ) {

    const id =
      Number(videoId);


    if (
      !Number.isInteger(id) ||
      id <= 0
    ) {

      throw new BadRequestException(
        'Invalid videoId',
      );

    }


    return this.commentRepository.find({

      where: {
        video: {
          id,
        },
      },

      relations: [
        'author',
      ],

      order: {
        id: 'ASC',
      },

    });

  }


  // =====================================
  // GET STORY COMMENTS
  // =====================================

  async getStoryComments(
    storyId: number,
  ) {

    const id =
      Number(storyId);


    if (
      !Number.isInteger(id) ||
      id <= 0
    ) {

      throw new BadRequestException(
        'Invalid storyId',
      );

    }


    return this.commentRepository.find({

      where: {
        story: {
          id,
        },
      },

      relations: [
        'author',
      ],

      order: {
        id: 'ASC',
      },

    });

  }


  // =====================================
  // GET SINGLE COMMENT
  // =====================================

  async getComment(
    commentId: number,
  ) {

    const id =
      Number(commentId);


    if (
      !Number.isInteger(id) ||
      id <= 0
    ) {

      throw new BadRequestException(
        'Invalid commentId',
      );

    }


    const comment =
      await this.commentRepository.findOne({

        where: {
          id,
        },

        relations: [
          'author',
          'video',
          'story',
        ],

      });


    if (!comment) {

      throw new NotFoundException(
        'Comment not found',
      );

    }


    return comment;

  }


  // =====================================
  // DELETE COMMENT
  // =====================================

  async remove(
    commentId: number,
    user: User,
  ) {

    const id =
      Number(commentId);


    const comment =
      await this.commentRepository.findOne({

        where: {
          id,
        },

        relations: [
          'author',
        ],

      });


    if (!comment) {

      throw new NotFoundException(
        'Comment not found',
      );

    }


    if (
      !comment.author ||
      Number(comment.author.id) !==
        Number(user.id)
    ) {

      throw new BadRequestException(
        'You can only delete your own comment',
      );

    }


    await this.commentRepository.remove(
      comment,
    );


    return {

      success: true,

      message:
        'Comment deleted successfully',

    };

  }

}
