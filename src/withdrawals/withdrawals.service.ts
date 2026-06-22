import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Withdrawal } from './withdrawal.entity';

import { NotificationsService }
from '../notifications/notifications.service';

@Injectable()
export class WithdrawalsService {

  constructor(

  @InjectRepository(Withdrawal)
  private withdrawalRepository:
    Repository<Withdrawal>,

  private notificationsService:
    NotificationsService,

) {}

  async getPendingWithdrawals() {

    return this.withdrawalRepository.find({

      where: {
        status: 'pending',
      },

      order: {
        createdAt: 'DESC',
      },

    });

  }

  async markPaid(id: number) {

  const withdrawal =
    await this.withdrawalRepository.findOne({
      where: { id },
    });

  if (!withdrawal) {

    throw new NotFoundException(
      'Withdrawal not found',
    );

  }

  withdrawal.status = 'paid';

const saved =
  await this.withdrawalRepository.save(
    withdrawal,
  );

await this.notificationsService
.createNotification(

  withdrawal.userId,

  'Withdrawal Approved 🏦',

  `Your withdrawal of ₦${Number(withdrawal.amount).toLocaleString()} has been approved and paid.`,

  'withdrawal',

  '/wallet.html',

);

return saved;

}


  async getUserWithdrawals(
  userId: number,
) {

  return this.withdrawalRepository.find({

    where: {
      userId,
    },

    order: {
      createdAt: 'DESC',
    },

  });

}

}