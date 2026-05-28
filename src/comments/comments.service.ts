import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Comment } from './comment.entity';

import { Video } from '../videos/video.entity';

import { Story } from '../stories/story.entity';

import { CreateCommentDto } from './dto/create-comment.dto';

import { User } from '../users/user.entity';

@Injectable()
export class CommentsService {

  constructor(

    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,

    @InjectRepository(Video)
    private videoRepository: Repository<Video>,

    @InjectRepository(Story)
    private storyRepository: Repository<Story>,

    @InjectRepository(User)
    private userRepository: Repository<User>,

  ) {}

  // =====================================
  // CREATE COMMENT
  // =====================================

  async create(
  dto: CreateCommentDto,
  user: any,
) {

  console.log('DTO RECEIVED:', dto);

  const author =
    await this.userRepository.findOne({
      where: {
        id: user.userId,
      },
    });

  if (!author) {

    throw new NotFoundException(
      'User not found',
    );

  }

  if (!dto.videoId && !dto.storyId) {

    throw new BadRequestException(
      'videoId or storyId required',
    );

  }

  const comment = new Comment();

  comment.text = dto.text;

  comment.time = dto.time || 0;

  comment.parentId = dto.parentId;

  comment.author = author;

  // =========================
  // VIDEO
  // =========================

  if (dto.videoId) {

    const video =
      await this.videoRepository.findOne({
        where: {
          id: dto.videoId,
        },
      });

    if (!video) {

      throw new NotFoundException(
        'Video not found',
      );

    }

    comment.video = video;

  }

  // =========================
  // STORY
  // =========================

  if (dto.storyId) {

    const story =
      await this.storyRepository.findOne({
        where: {
          id: dto.storyId,
        },
      });

    if (!story) {

      throw new NotFoundException(
        'Story not found',
      );

    }

    comment.story = story;

  }

  return this.commentRepository.save(
    comment,
  );

}

  // =====================================
  // VIDEO COMMENTS
  // =====================================

  async getVideoComments(
    videoId: number,
  ) {

    return this.commentRepository.find({

      where: {
        video: {
          id: videoId,
        },
      },

      relations: ['author'],

      order: {
        id: 'ASC',
      },

    });

  }

  // =====================================
  // STORY COMMENTS
  // =====================================

  async getStoryComments(
    storyId: number,
  ) {

    return this.commentRepository.find({

      where: {
        story: {
          id: storyId,
        },
      },

      relations: ['author'],

      order: {
        id: 'ASC',
      },

    });

  }

}