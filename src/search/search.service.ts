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
        take: 10
      });

    // =========================
    // VIDEOS
    // =========================

    const videos =
      await this.videoRepo.find({
        where: [
          {
            title: ILike(`%${query}%`),
            type: 'video'
          },
          {
            context: ILike(`%${query}%`),
            type: 'video'
          }
        ],
        relations: ['creator'],
        order: {
          createdAt: 'DESC'
        },
        take: 10
      });

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
        take: 10
      });

    // =========================
    // PRODUCTS
    // =========================

    const products =
      await this.videoRepo.find({
        where: [
          {
            title: ILike(`%${query}%`),
            type: 'fashion'
          },
          {
            context: ILike(`%${query}%`),
            type: 'fashion'
          }
        ],
        relations: ['creator'],
        order: {
          createdAt: 'DESC'
        },
        take: 10
      });

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
      }))

    };

  }

}