import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

import { WalletsService } from '../wallets/wallets.service';

import { UsersService } from '../users/users.service';

@Injectable()

export class PayoutsService {

  constructor(

    private walletsService: WalletsService,

    private usersService: UsersService,

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

    wallet.balance =
      Number(wallet.balance) - amount;

    return {
      success: true,
      amount,
      balance: wallet.balance,
    };

  }

}