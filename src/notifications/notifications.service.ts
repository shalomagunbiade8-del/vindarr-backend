import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Notification } from './notification.entity';

@Injectable()
export class NotificationsService {

  constructor(

    @InjectRepository(Notification)
    private notificationRepository:
      Repository<Notification>,

  ) {}

  // =====================================
  // CREATE NOTIFICATION
  // =====================================

  async createNotification(

    userId: number,

    title: string,

    message: string,

    type: string,

    link?: string,

  ) {

    const notification =
      this.notificationRepository.create({

        userId,

        title,

        message,

        type,

         link,

      });

    return this.notificationRepository.save(
      notification,
    );

  }

  // =====================================
  // GET USER NOTIFICATIONS
  // =====================================

 async getUserNotifications(
  userId: number,
  page = 1,
) {

  return this.notificationRepository.find({

    where: {
      userId,
    },

    order: {
      createdAt: 'DESC',
    },

    skip: (page - 1) * 30,

    take: 30,

  });

}

  // =====================================
  // UNREAD COUNT
  // =====================================

  async getUnreadCount(
    userId: number,
  ) {

    const count =
      await this.notificationRepository.count({

        where: {
          userId,
          isRead: false,
        },

      });

    return {
      unread: count,
    };

  }

  // =====================================
  // MARK AS READ
  // =====================================

  async markAsRead(
    id: number,
    userId: number,
  ) {

    const notification =
      await this.notificationRepository.findOne({

        where: {
          id,
          userId,
        },

      });

    if (!notification) {

      throw new NotFoundException(
        'Notification not found',
      );

    }

    notification.isRead = true;

    return this.notificationRepository.save(
      notification,
    );

  }

  // =====================================
  // MARK ALL READ
  // =====================================

  async markAllAsRead(
    userId: number,
  ) {

    await this.notificationRepository.update(

      {
        userId,
        isRead: false,
      },

      {
        isRead: true,
      },

    );

    return {
      success: true,
    };

  }

  async deleteOldNotifications(){

const cutoff =
new Date();

cutoff.setMonth(
cutoff.getMonth() - 6
);

await this.notificationRepository
.createQueryBuilder()

.delete()

.where(
'createdAt < :cutoff',
{ cutoff }
)

.execute();

}

// Auto clean up
async cleanupOldNotifications(
  userId: number,
) {

  const notifications =
    await this.notificationRepository.find({

      where: { userId },

      order: {
        createdAt: 'DESC',
      },

    });

  if (
    notifications.length <= 200
  ) {
    return;
  }

  const excess =
    notifications.slice(200);

  await this.notificationRepository.remove(
    excess,
  );

}

}