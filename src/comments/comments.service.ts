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
import { Video } from '../videos/video.entity';
import { Story } from '../stories/story.entity';

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
// TARGET VALIDATION
// =====================================

if (
  !dto.videoId &&
  !dto.storyId
) {

  throw new BadRequestException(
    'A videoId or storyId is required',
  );

}


// A comment should belong to only
// one resource.

if (
  dto.videoId &&
  dto.storyId
) {

  throw new BadRequestException(
    'A comment cannot belong to both a video and a story',
  );

}


// =====================================
// PARENT COMMENT VALIDATION
// =====================================

if (dto.parentId) {

  const parent =
    await this.commentRepository.findOne({
      where: {
        id: dto.parentId,
      },
      relations: [
        'video',
        'story',
      ],
    });


  // Parent does not exist
  if (!parent) {

    throw new NotFoundException(
      'Parent comment not found',
    );

  }


  // ===================================
  // PREVENT SELF-REPLY
  // ===================================

  if (
    Number(parent.id) ===
    Number(dto.parentId)
  ) {

    throw new BadRequestException(
      'A comment cannot reply to itself',
    );

  }


  // ===================================
  // VIDEO REPLY
  // ===================================

  if (dto.videoId) {

    if (
      !parent.video ||
      Number(parent.video.id) !==
        Number(dto.videoId)
    ) {

      throw new BadRequestException(
        'Parent comment does not belong to this video',
      );

    }

  }


  // ===================================
  // STORY REPLY
  // ===================================

  if (dto.storyId) {

    if (
      !parent.story ||
      Number(parent.story.id) !==
        Number(dto.storyId)
    ) {

      throw new BadRequestException(
        'Parent comment does not belong to this story',
      );

    }

  }

}


// =====================================
// CREATE COMMENT
// =====================================

const comment =
  this.commentRepository.create({

    text: dto.text,

    time: dto.time,

    parentId: dto.parentId,

    author: user,

    video: dto.videoId
      ? ({ id: dto.videoId } as Video)
      : undefined,

    story: dto.storyId
      ? ({ id: dto.storyId } as Story)
      : undefined,

  });


// =====================================
// SAVE
// =====================================

const savedComment =
  await this.commentRepository.save(
    comment,
  );


// =====================================
// RETURN COMMENT WITH AUTHOR
// =====================================

const result =
  await this.commentRepository.findOne({
    where: {
      id: savedComment.id,
    },
    relations: [
      'author',
    ],
  });


return result;


}

// =====================================
// GET VIDEO COMMENTS
// =====================================

async getVideoComments(
videoId: number,
) {


const comments =
  await this.commentRepository.find({

    where: {
      video: {
        id: videoId,
      },
    },

    relations: [
      'author',
    ],

    order: {
      id: 'ASC',
    },

  });


return comments;


}

// =====================================
// GET STORY COMMENTS
// =====================================

async getStoryComments(
storyId: number,
) {


const comments =
  await this.commentRepository.find({

    where: {
      story: {
        id: storyId,
      },
    },

    relations: [
      'author',
    ],

    order: {
      id: 'ASC',
    },

  });


return comments;


}

// =====================================
// GET SINGLE COMMENT
// =====================================

async getComment(
commentId: number,
) {


const comment =
  await this.commentRepository.findOne({

    where: {
      id: commentId,
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


const comment =
  await this.commentRepository.findOne({

    where: {
      id: commentId,
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


// Only the author can delete
// their own comment.

if (
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
  message: 'Comment deleted successfully',
};


}

}
