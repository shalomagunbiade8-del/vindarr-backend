import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './comment.entity';
import { Video } from '../videos/video.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { User } from '../users/user.entity';

@Injectable()
export class CommentsService {

  constructor(
  @InjectRepository(Comment)
  private commentRepository: Repository<Comment>,

  @InjectRepository(Video)
  private videoRepository: Repository<Video>,

  @InjectRepository(User)
  private userRepository: Repository<User>,
) {} 

  async create(dto: CreateCommentDto, user: any) {

  const video = await this.videoRepository.findOne({
    where: { id: dto.videoId }
  });

  if (!video) {
    throw new NotFoundException('Video not found');
  }

  const author = await this.userRepository.findOne({
    where: { id: user.userId }
  });

  if (!author) {
    throw new NotFoundException('User not found');
  }

  const comment = new Comment();

  comment.text = dto.text;
  comment.time = dto.time;
  comment.parentId = dto.parentId;
  comment.video = video;
  comment.author = author;

  return this.commentRepository.save(comment);
} 

  async getVideoComments(videoId: number) {

    return this.commentRepository.find({
      where: {
        video: { id: videoId }
      },
      relations: ['author'],
      order: { time: 'ASC' }
    });

  }

} 
