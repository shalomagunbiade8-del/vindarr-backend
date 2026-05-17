import { Injectable } from '@nestjs/common';

import { OrdersService } from '../orders/orders.service';

@Injectable()

export class EarningsService {

  constructor(
    private ordersService: OrdersService,
  ) {}

  async getCreatorEarnings(
    creatorId: number,
  ) {

    const sales =
      await this.ordersService.getCreatorSales(
        creatorId,
      );

    const totalEarnings =
      sales.reduce((sum, sale) => {

        return (
          sum + Number(sale.creatorAmount)
        );

      }, 0);

    return {

      totalEarnings,

      transactions:
        sales.map(sale => ({

          id: sale.id,

          amount:
            sale.creatorAmount,

          type:
            sale.productType,

          createdAt:
            sale.createdAt,

          title:
            `${sale.productType} sale`,

        })),

    };

  }

}