import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Wallet } from './wallet.entity';

@Injectable()

export class WalletsService {

  constructor(

    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,

  ) {}

  // =====================================
  // GET OR CREATE WALLET
  // =====================================

  async getWallet(userId: number) {

    let wallet =
      await this.walletRepository.findOne({
        where: { userId },
      });

    if (!wallet) {

      wallet =
        this.walletRepository.create({
          userId,
          balance: 0,
        });

      wallet =
        await this.walletRepository.save(
          wallet,
        );

    }

    return wallet;

  }

  // =====================================
  // CREDIT WALLET
  // =====================================

  async creditWallet(
    userId: number,
    amount: number,
  ) {

    const wallet =
      await this.getWallet(userId);

    wallet.balance =
      Number(wallet.balance) +
      Number(amount);

    return this.walletRepository.save(
      wallet,
    );

  }

  // =====================================
  // GET BALANCE
  // =====================================

  async getBalance(userId: number) {

    const wallet =
      await this.getWallet(userId);

    return {

      balance:
        Number(wallet.balance),

    };

  }

}