import { Injectable } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository, ILike } from 'typeorm';

import { User } from '../users/user.entity';
import { Video } from '../videos/video.entity';
import { Story } from '../stories/story.entity';

@Injectable()
export class SearchService {

  constructor(

    @InjectRepository(User)
    private userRepo: Repository<User>,

    @InjectRepository(Video)
    private videoRepo: Repository<Video>,

    @InjectRepository(Story)
    private storyRepo: Repository<Story>,

  ) {}

  async globalSearch(query: string) {

    // =========================
    // CREATORS
    // =========================

    const creators =
      await this.userRepo.find({
        where: [
          {
            username: ILike(`%${query}%`)
          },
          {
            bio: ILike(`%${query}%`)
          }
        ],
      });

    // =========================
    // VIDEOS
    // =========================

    const videos =
await this.videoRepo
.createQueryBuilder('video')
.leftJoinAndSelect(
  'video.creator',
  'creator'
)
.where(
  'video.type = :type',
  {
    type:'video'
  }
)
.andWhere(
`
(
LOWER(video.title)
LIKE LOWER(:q)

OR

LOWER(video.context)
LIKE LOWER(:q)

OR

LOWER(video.category)
LIKE LOWER(:q)

OR

LOWER(creator.username)
LIKE LOWER(:q)
)
`,
{
  q:`%${query}%`
}
)
.orderBy(
  'video.createdAt',
  'DESC'
)
.getMany();

    // =========================
    // EBOOKS
    // =========================

    const ebooks =
      await this.videoRepo.find({
        where: [
          {
            title: ILike(`%${query}%`),
            type: 'ebook'
          },
          {
            context: ILike(`%${query}%`),
            type: 'ebook'
          }
        ],
        relations: ['creator'],
        order: {
          createdAt: 'DESC'
        },
        
      });

    // =========================
    // PRODUCTS
    // FASHION + ESSENTIALS
    // =========================

    const products =
      await this.videoRepo
        .createQueryBuilder('video')
        .leftJoinAndSelect(
          'video.creator',
          'creator',
        )
        .where(
          '(video.type = :fashion OR video.type = :essential)',
          {
            fashion: 'fashion',
            essential: 'essential',
          },
        )
        .andWhere(
          '(LOWER(video.title) LIKE LOWER(:q) OR LOWER(video.context) LIKE LOWER(:q))',
          {
            q: `%${query}%`,
          },
        )
        .orderBy(
          'video.createdAt',
          'DESC',
        )
        .take(20)
        .getMany();

    // =========================
    // STORIES
    // =========================

    const stories =
      await this.storyRepo.find({
        where: [
          {
            title: ILike(`%${query}%`)
          },
          {
            content: ILike(`%${query}%`)
          }
        ],
        relations: ['user'],
        order: {
          createdAt: 'DESC'
        },
      });

    // =========================
    // RETURN
    // =========================

    return {

      creators: creators.map(user => ({
        id: user.id,
        username: user.username,
        avatar: user.avatar,
        bio: user.bio
      })),

      videos: videos.map(video => ({
        id: video.id,
        title: video.title,
        videoUrl: video.videoUrl,
        context: video.context,
        creatorAvatar: video.creator?.avatar,
        creatorUsername:
          video.creator?.username || 'creator'
      })),

      ebooks: ebooks.map(book => ({
        id: book.id,
        title: book.title,
        coverImage: book.coverUrl,
        price: book.price
      })),

      products: products.map(product => ({
        id: product.id,
        title: product.title,
        file: product.fileUrl,
        videoUrl: product.videoUrl,
        coverImage: product.coverUrl,
        price: product.price
      })),

      stories: stories.map(story => ({
        id: story.id,
        title: story.title,
        imageUrl: story.imageUrl,
        username:
          story.user?.username || 'User'
      }))

    };

  }

}