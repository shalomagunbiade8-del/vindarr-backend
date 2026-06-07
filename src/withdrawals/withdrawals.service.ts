import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Withdrawal } from './withdrawal.entity';

@Injectable()
export class WithdrawalsService {

  constructor(

    @InjectRepository(Withdrawal)
    private withdrawalRepository:
      Repository<Withdrawal>,

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

    return this.withdrawalRepository.save(
      withdrawal,
    );

  }

}