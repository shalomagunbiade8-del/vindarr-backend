import {
  Injectable,
  ForbiddenException,
} from '@nestjs/common';

import {
  InjectRepository,
} from '@nestjs/typeorm';

import {
  Repository,
} from 'typeorm';

import { User } from '../users/user.entity';
import { Video } from '../videos/video.entity';
import { Order } from '../orders/order.entity';
import { Withdrawal } from '../withdrawals/withdrawal.entity';

@Injectable()
export class AdminService {

  constructor(

    @InjectRepository(User)
    private readonly userRepository:
      Repository<User>,

    @InjectRepository(Video)
    private readonly videoRepository:
      Repository<Video>,

    @InjectRepository(Order)
    private readonly orderRepository:
      Repository<Order>,

    @InjectRepository(Withdrawal)
    private readonly withdrawalRepository:
      Repository<Withdrawal>,

  ) {}

  // =====================================
  // ADMIN CHECK
  // =====================================

  private checkAdmin(req: any) {

    if (
      !req?.user ||
      req.user.role !== 'admin'
    ) {

      throw new ForbiddenException(
        'Admins only',
      );

    }

  }

  // =====================================
  // DASHBOARD STATISTICS
  // =====================================

  async getDashboardStats(req: any) {

    this.checkAdmin(req);

    // =====================================
    // DATE RANGES
    // =====================================

    const now = new Date();

    const startOfToday =
      new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
      );

    // Monday of current week

    const startOfWeek =
      new Date(startOfToday);

    const day =
      startOfWeek.getDay();

    const diff =
      day === 0
        ? 6
        : day - 1;

    startOfWeek.setDate(
      startOfWeek.getDate() - diff,
    );

    const startOfMonth =
      new Date(
        now.getFullYear(),
        now.getMonth(),
        1,
      );

    // =====================================
    // USERS
    // =====================================

    const totalUsers =
      await this.userRepository.count();

    const newToday =
      await this.userRepository
        .createQueryBuilder('user')
        .where(
          'user.createdAt >= :start',
          {
            start: startOfToday,
          },
        )
        .getCount();

    const newThisWeek =
      await this.userRepository
        .createQueryBuilder('user')
        .where(
          'user.createdAt >= :start',
          {
            start: startOfWeek,
          },
        )
        .getCount();

    const newThisMonth =
      await this.userRepository
        .createQueryBuilder('user')
        .where(
          'user.createdAt >= :start',
          {
            start: startOfMonth,
          },
        )
        .getCount();

    // =====================================
    // CONTENT
    // =====================================

    const totalVideos =
      await this.videoRepository.count({
        where: {
          type: 'video',
        },
      });

    const totalEbooks =
      await this.videoRepository.count({
        where: {
          type: 'ebook',
        },
      });

    const totalFashion =
      await this.videoRepository.count({
        where: {
          type: 'fashion',
        },
      });

    const totalEssentials =
      await this.videoRepository.count({
        where: {
          type: 'essential',
        },
      });

    const totalContent =
      totalVideos +
      totalEbooks +
      totalFashion +
      totalEssentials;

    // =====================================
    // PAID ORDERS
    // =====================================

    const paidOrders =
      await this.orderRepository.find({
        where: {
          paymentStatus: 'paid',
        },
      });

    // =====================================
    // SALES
    // =====================================

    let totalSales = 0;

    let platformRevenue = 0;

    let creatorRevenue = 0;

    for (
      const order of paidOrders
    ) {

      totalSales +=
        Number(order.amount || 0);

      platformRevenue +=
        Number(
          order.platformAmount || 0,
        );

      creatorRevenue +=
        Number(
          order.creatorAmount || 0,
        );

    }

    // =====================================
    // WITHDRAWALS
    // =====================================

    const pendingWithdrawals =
      await this.withdrawalRepository.find({
        where: {
          status: 'pending',
        },
      });

    const paidWithdrawals =
      await this.withdrawalRepository.find({
        where: {
          status: 'paid',
        },
      });

    let pendingWithdrawalAmount = 0;

    let paidWithdrawalAmount = 0;

    for (
      const withdrawal of
      pendingWithdrawals
    ) {

      pendingWithdrawalAmount +=
        Number(
          withdrawal.amount || 0,
        );

    }

    for (
      const withdrawal of
      paidWithdrawals
    ) {

      paidWithdrawalAmount +=
        Number(
          withdrawal.amount || 0,
        );

    }

    // =====================================
    // RETURN DASHBOARD
    // =====================================

    return {

      users: {

        total:
          totalUsers,

        newToday:
          newToday,

        newThisWeek:
          newThisWeek,

        newThisMonth:
          newThisMonth,

      },

      content: {

        total:
          totalContent,

        videos:
          totalVideos,

        ebooks:
          totalEbooks,

        fashion:
          totalFashion,

        essentials:
          totalEssentials,

      },

      sales: {

        orders:
          paidOrders.length,

        totalSales:
          Number(
            totalSales.toFixed(2),
          ),

        platformRevenue:
          Number(
            platformRevenue.toFixed(2),
          ),

        creatorRevenue:
          Number(
            creatorRevenue.toFixed(2),
          ),

      },

      withdrawals: {

        pendingCount:
          pendingWithdrawals.length,

        pendingAmount:
          Number(
            pendingWithdrawalAmount.toFixed(2),
          ),

        paidAmount:
          Number(
            paidWithdrawalAmount.toFixed(2),
          ),

      },

    };

  }

}