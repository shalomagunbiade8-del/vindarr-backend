import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Video } from './video.entity';
import { CreateVideoDto } from './dto/create-video.dto';
import { User } from '../users/user.entity';
import { Understand } from '../understand/understand.entity';
import { Library } from '../library/library.entity';

@Injectable()
export class VideosService {
  constructor(
    @InjectRepository(Video)
    private videoRepository: Repository<Video>,

    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(Understand)
private understandRepository: Repository<Understand>,

@InjectRepository(Library)
private libraryRepository: Repository<Library>,
  ) {}

  async create(dto: any, userId: number)  {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    console.log(
  "FILE URL RECEIVED BY SERVICE:",
  dto.fileUrl,
);

    const video = this.videoRepository.create({
      ...dto,
      creator: user,
      creatorId: userId,
    });

    const savedVideo = await this.videoRepository.save(video as any);

return this.videoRepository.findOne({
  where: { id: (savedVideo as any).id },
  relations: ['creator'],
}); 

  }

  async findAll(
  page: number = 1,
  limit: number = 10,
) {

  const skip = (page - 1) * limit;

  const [videos, total] =
    await this.videoRepository.findAndCount({
      relations: [
        'creator',
        'comments',
        'comments.author',
      ],
      order: {
        createdAt: 'DESC',
      },
      skip,
      take: limit,
    });

  return {
    data: videos.map(v => ({
      id: v.id,
      title: v.title,
      category: v.category,
      context: v.context,

      type: v.type,

      videoUrl: v.videoUrl,
      fileUrl: v.fileUrl,
      coverUrl: v.coverUrl,

      price: v.price,

      understandCount: v.understandCount,

      creatorId: v.creatorId,
      creatorUsername:
        v.creator?.username || 'User',

      creatorAvatar:
        v.creator?.avatar || null,

      comments: v.comments || [],

      createdAt: v.createdAt,
    })),

    total,
    page,
    limit,
    hasMore:
      skip + videos.length < total,
  };
}


async findOne(id: number) {

  const video = await this.videoRepository.findOne({
    where: { id },
    relations: ['creator', 'comments', 'comments.author'],
  });

  if (!video) {
    throw new NotFoundException('Content not found');
  }

  return {
    id: video.id,
    title: video.title,
    category: video.category,
    context: video.context,

    type: video.type,

    videoUrl: video.videoUrl,
    fileUrl: video.fileUrl,
    coverUrl: video.coverUrl,

    price: video.price,

    creatorId: video.creatorId,
    creatorUsername: video.creator?.username,
    creatorAvatar: video.creator?.avatar,

    comments: video.comments,

    createdAt: video.createdAt,
  };
}

async getVideosByCreator(creatorId: number){

  const videos = await this.videoRepository.find({
    where: { creatorId },
    order: { createdAt: 'DESC' }
  });

  return videos;

} 

  async deleteVideo(id: number, userId: number) {
    const video = await this.videoRepository.findOne({
      where: { id },
    });

    if (!video) {
      throw new NotFoundException('Video not found');
    }

    if (video.creatorId !== userId) {
      throw new ForbiddenException('You cannot delete this video');
    }

    await this.videoRepository.delete(id);

    return { message: 'Video deleted successfully' };
  }

  async pressUnderstand(videoId: number, userId: number) {

  const video = await this.videoRepository.findOne({
    where: { id: videoId },
  });

  if (!video) {
    throw new NotFoundException('Video not found');
  }

  // Check if user already pressed understand
  const existing = await this.understandRepository.findOne({
    where: {
      videoId: videoId,
      userId: userId,
    },
  });

  if (existing) {
    return {
  understandCount: video.understandCount,
  message: 'Already understood',
};
  }

  // Save understand record
  const understand = this.understandRepository.create({
    videoId: videoId,
    userId: userId,
  });

  await this.understandRepository.save(understand);

  // Increase video understand count
  video.understandCount++;

  await this.videoRepository.save(video);

  // Update creator totalUnderstand
  const creator = await this.userRepository.findOne({
    where: { id: video.creatorId },
  });

  if (creator) {
    creator.totalUnderstand = (creator.totalUnderstand || 0) + 1;
    await this.userRepository.save(creator);
  }

  return {
  understandCount: video.understandCount,
};
}

async searchVideos(query: string) {
  if (!query) return [];

  const videos = await this.videoRepository
    .createQueryBuilder('video')
    .leftJoinAndSelect('video.creator', 'creator')
    .leftJoinAndSelect('video.comments', 'comments')
    .where('LOWER(video.title) LIKE LOWER(:query)', { query: `%${query}%` })
    .orWhere('LOWER(video.category) LIKE LOWER(:query)', { query: `%${query}%` })
    .orWhere('LOWER(video.context) LIKE LOWER(:query)', { query: `%${query}%` })
    .orderBy('video.createdAt', 'DESC')
    .getMany();

  return videos.map(v => ({
    id: v.id,
    title: v.title,
    category: v.category,
    context: v.context,
    videoUrl: v.videoUrl,

    understandCount: v.understandCount,

    creatorId: v.creatorId,
    creatorUsername: v.creator?.username || 'User',
    creatorAvatar: v.creator?.avatar || null,

    createdAt: v.createdAt,
  }));
} 

async getMarket(type: string) {

  const query = this.videoRepository
    .createQueryBuilder('item')
    .leftJoinAndSelect('item.creator', 'creator')
    .orderBy('item.createdAt', 'DESC');

  if (type) {
    query.andWhere('item.type = :type', { type });
  }

  const items = await query.getMany();

  return items.map(item => ({
    id: item.id,
    title: item.title,
    type: item.type,

    videoUrl: item.videoUrl,
    fileUrl: item.fileUrl,
    coverUrl: item.coverUrl,

    price: item.price,

    creatorUsername:
  item.creator?.username || 'User',
  }));
} 

async updateVideo(
  id: number,
  dto: any,
  userId: number,
) {

  const video =
    await this.videoRepository.findOne({
      where: { id },
    });

  if (!video) {
    throw new NotFoundException();
  }

  if (video.creatorId !== userId) {
    throw new ForbiddenException();
  }

  Object.assign(video, dto);

  return this.videoRepository.save(video);
}

}
