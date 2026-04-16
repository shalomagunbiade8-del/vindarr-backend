import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Story } from './story.entity';
import { CreateStoryDto } from './dto/create-story.dto';
import { User } from '../users/user.entity';
import { ILike } from 'typeorm'; 

@Injectable()
export class StoriesService {

  constructor(
  @InjectRepository(Story)
  private storyRepository: Repository<Story>,

  @InjectRepository(User)
  private userRepository: Repository<User>,
) {} 

  async create(dto: CreateStoryDto, userId: number) {

  const user = await this.userRepository.findOne({
    where: { id: userId }
  });

  const story = this.storyRepository.create({
    title: dto.title,
    content: dto.content,
    imageUrl: dto.imageUrl || undefined,
    userId: userId,

    // ✅ REAL avatar from DB
    avatar: user?.avatar || "https://i.pravatar.cc/150"
  });

  return this.storyRepository.save(story);
} 


  async findAll(currentUserId?: number, page = 1, limit = 6) {

  const [stories, total] = await this.storyRepository.findAndCount({
    relations: ['user'],
    order: { createdAt: 'DESC' },
    skip: (page - 1) * limit,
    take: limit,
  });

  return {
    data: stories.map(story => ({
      id: story.id,
      title: story.title,
      content: story.content,
      imageUrl: story.imageUrl,
      avatar: story.avatar || "https://i.pravatar.cc/150", 
      createdAt: story.createdAt,
      author: story.user?.username || "User",
      username: story.user?.username || "User", 
      likesCount: story.likedBy?.length || 0,
      isLiked: currentUserId
        ? story.likedBy?.includes(currentUserId)
        : false,
      userId: story.userId
    })),
    total
  };
} 

  async deleteStory(id: number, userId: number) {
  const story = await this.storyRepository.findOne({
    where: { id },
  });

  if (!story) {
    throw new NotFoundException('Story not found');
  }

  if (story.userId !== userId) {
    throw new ForbiddenException('You cannot delete this story');
  }

  await this.storyRepository.delete(id);

  return { message: 'Story deleted successfully' };
} 

async toggleLike(storyId: number, userId: number) {
  const story = await this.storyRepository.findOne({
    where: { id: storyId },
  });

  if (!story) {
    throw new NotFoundException('Story not found');
  }

  if (!story.likedBy) {
    story.likedBy = [];
  }

  const alreadyLiked = story.likedBy.includes(userId);

  if (alreadyLiked) {
    story.likedBy = story.likedBy.filter(id => id !== userId);
  } else {
    story.likedBy.push(userId);
  }

  await this.storyRepository.save(story);

  return {
    liked: !alreadyLiked,
    likesCount: story.likedBy.length,
  };
}

async search(query: string) {

  return this.storyRepository.find({
    where: [
      { title: ILike(`%${query}%`) },
      { content: ILike(`%${query}%`) }
    ],
    relations: ['user'],
    order: { createdAt: 'DESC' },
    take: 20
  });

} 

} 
