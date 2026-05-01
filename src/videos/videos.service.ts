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

@Injectable()
export class VideosService {
  constructor(
    @InjectRepository(Video)
    private videoRepository: Repository<Video>,

    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(Understand)
    private understandRepository: Repository<Understand>,
  ) {}

  async create(dto: any, userId: number)  {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

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

  async findAll(page: number = 1, limit: number = 10) {

  const skip = (page - 1) * limit;

  const videos = await this.videoRepository.find({
  relations: ['creator', 'comments'], // ✅ ADD THIS
    order: { createdAt: 'DESC' },
    skip: skip,
    take: limit
  });

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
    file: item.fileUrl,
    coverUrl: item.coverUrl,

    price: item.price,

    username: item.creator?.username || 'User',
  }));
} 

}
