import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Withdrawal } from '../withdrawals/withdrawal.entity';

import { WalletsService } from '../wallets/wallets.service';

import { UsersService } from '../users/users.service';

@Injectable()

export class PayoutsService {

  constructor(

  private walletsService: WalletsService,

  private usersService: UsersService,

  @InjectRepository(Withdrawal)
  private withdrawalRepository:
    Repository<Withdrawal>,

) {}

  async withdraw(
    userId: number,
    amount: number,
  ) {

    if (amount <= 0) {

      throw new BadRequestException(
        'Invalid amount',
      );

    }

    if (amount < 1000) {

  throw new BadRequestException(
    'Minimum withdrawal is ₦1000',
  );

}

    const wallet =
      await this.walletsService.getWallet(
        userId,
      );

    if (
      Number(wallet.balance) < amount
    ) {

      throw new BadRequestException(
        'Insufficient balance',
      );

    }

    const user =
  await this.usersService.findById(userId);

if (!user) {
  throw new NotFoundException(
    'User not found',
  );
}

if (
  !user.bankName ||
  !user.accountNumber ||
  !user.accountName
) {
  throw new BadRequestException(
    'Add bank details first',
  );
}

    await this.walletsService.debitWallet(
  userId,
  amount,
);

const withdrawal =
  this.withdrawalRepository.create({

    userId,

    amount,

    status: 'pending',

    bankName:
      user.bankName,

    accountNumber:
      user.accountNumber,

    accountName:
      user.accountName,

  });

await this.withdrawalRepository.save(
  withdrawal,
);

    const updatedWallet =
  await this.walletsService.getWallet(
    userId,
  );

return {

  success: true,

  withdrawalId:
    withdrawal.id,

  amount,

  status:
    withdrawal.status,

  balance:
    updatedWallet.balance,

};

  }

}