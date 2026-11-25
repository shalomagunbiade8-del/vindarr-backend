import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { Purview } from './purview.entity';
import { User } from '../users/user.entity';
import { Video } from '../videos/video.entity';

@Injectable()
export class PurviewService {
  constructor(
    @InjectRepository(Purview)
    private readonly purviewRepo: Repository<Purview>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Video)
    private readonly videoRepo: Repository<Video>,
  ) {}

  async addCreator(userId: number, creatorId: number) {
    if (!Number.isInteger(creatorId) || creatorId <= 0) {
      throw new NotFoundException('Creator not found');
    }

    const creator = await this.userRepo.findOne({
      where: { id: creatorId },
      select: ['id'],
    });

    if (!creator) {
      throw new NotFoundException('Creator not found');
    }

    const existing = await this.purviewRepo.findOne({
      where: { userId, creatorId },
    });

    if (existing) {
      return { success: true, message: 'Already in Purview' };
    }

    await this.purviewRepo.save(
      this.purviewRepo.create({ userId, creatorId }),
    );

    return { success: true, message: 'Creator added to Purview' };
  }

  async getCreators(userId: number) {
    const records = await this.purviewRepo.find({ where: { userId } });
    const ids = [...new Set(records.map((record) => record.creatorId))];

    if (!ids.length) return [];

    return this.userRepo.find({
      where: { id: In(ids) },
    });
  }

  async getFeed(userId: number, page = 1, limit = 20) {
    const safePage = Number.isFinite(page) ? Math.max(1, Math.floor(page)) : 1;
    const safeLimit = Number.isFinite(limit)
      ? Math.min(40, Math.max(1, Math.floor(limit)))
      : 20;

    const records = await this.purviewRepo.find({ where: { userId } });
    const creatorIds = [...new Set(records.map((record) => record.creatorId))];

    if (!creatorIds.length) {
      return {
        data: [],
        page: safePage,
        limit: safeLimit,
        total: 0,
        hasMore: false,
      };
    }

    const [data, total] = await this.videoRepo.findAndCount({
      where: creatorIds.map((creatorId) => ({ creatorId })),
      relations: ['creator'],
      order: { createdAt: 'DESC' },
      skip: (safePage - 1) * safeLimit,
      take: safeLimit,
    });

    return {
      data,
      page: safePage,
      limit: safeLimit,
      total,
      hasMore: safePage * safeLimit < total,
    };
  }
}