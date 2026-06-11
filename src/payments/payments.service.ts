import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { ConfigService } from '@nestjs/config';

import axios from 'axios';

import { OrdersService } from '../orders/orders.service';

import { VideosService } from '../videos/videos.service';

import { UsersService } from '../users/users.service';

import { WalletsService } from '../wallets/wallets.service';

import { LibraryService } from '../library/library.service';

import * as crypto from 'crypto';


@Injectable()

export class PaymentsService {

  private PAYSTACK_SECRET: string;

  constructor(

    private ordersService: OrdersService,

    private videosService: VideosService,

    private usersService: UsersService,

    private walletsService: WalletsService,

    private libraryService: LibraryService,

    private configService: ConfigService,

  ) {

    this.PAYSTACK_SECRET =
      this.configService.get<string>(
        'PAYSTACK_SECRET_KEY',
      )!;

  }

  async initializeMarketPayment(
    productId: number,
    buyerId: number,
  ) {

    const product =
      await this.videosService.findOne(
        productId,
      );

      console.log('PRODUCT FOUND', product);

    if (!product) {
      throw new NotFoundException(
        'Product not found',
      );
    }

    const buyer =
      await this.usersService.findOneById(
        buyerId,
      );

    if (!buyer) {
      throw new NotFoundException(
        'Buyer not found',
      );
    }

    if (
      product.creatorId === buyerId
    ) {
      throw new BadRequestException(
        'You cannot buy your own product',
      );
    }

    const order =
      await this.ordersService.create(
        productId,
        buyerId,
      );

    const response =
  await axios.post(
    'https://api.paystack.co/transaction/initialize',
    {
      email: buyer.email,

      amount:
        Number(product.price) * 100,

      callback_url:
`${this.configService.get(
  'FRONTEND_URL'
)}/payment-success.html`,

      metadata: {

        orderId: order.id,

        buyerId,

        productId,

        type: product.type,

      },

    },
        {

          headers: {

            Authorization:
              `Bearer ${this.PAYSTACK_SECRET}`,

            'Content-Type':
              'application/json',

          },

        },

      );

    return {

      checkoutUrl:
        response.data.data.authorization_url,

      reference:
        response.data.data.reference,

      orderId:
        order.id,

    };

  }

  async verifyMarketPayment(
  reference: string,
){

    console.log(
  'VERIFY REQUEST RECEIVED',
  reference,
);

    const response =
      await axios.get(

        `https://api.paystack.co/transaction/verify/${reference}`,

        {

          headers: {

            Authorization:
              `Bearer ${this.PAYSTACK_SECRET}`,

          },

        },

      );

    const data =
      response.data;

      console.log(
  'PAYSTACK RESPONSE:',
  JSON.stringify(data, null, 2),
);

console.log(
  'PAYSTACK METADATA:',
  data.data.metadata,
);

    if (
      data.data.status !== 'success'
    ) {

      throw new BadRequestException(
        'Payment failed',
      );

    }

    const paystackOrderId =
  Number(
    data.data.metadata.orderId,
  );

const order =
  await this.ordersService.findById(
    paystackOrderId,
  );

console.log('ORDER FOUND', order);

console.log(
  'PAYSTACK ORDER ID:',
  paystackOrderId,
);

console.log(
  'DATABASE ORDER ID:',
  order.id,
);

      if (
  paystackOrderId !==
  Number(order.id)
) {

  console.log(
    'METADATA MISMATCH',
    data.data.metadata.orderId,
    order.id,
  );

  throw new BadRequestException(
    'Invalid payment metadata',
  );

}

    if (!order) {

      throw new NotFoundException(
        'Order not found',
      );

    }

    if (
  order.paymentStatus === 'paid'
) {

  return {
    success: true,
    message: 'Already verified',
  };

}

    const paystackAmount =
  Number(data.data.amount);

const orderAmount =
  Number(order.amount) * 100;

console.log(
  'PAYSTACK AMOUNT:',
  paystackAmount,
);

console.log(
  'ORDER AMOUNT:',
  orderAmount,
);

if (paystackAmount !== orderAmount) {

  throw new BadRequestException(
    `Amount mismatch: ${paystackAmount} vs ${orderAmount}`,
  );

}

console.log(
  'PAYMENT VERIFIED - MARKING ORDER PAID'
);

    await this.ordersService
      .markOrderAsPaid(
        order.id,
        reference,
      );

      console.log(
  'ORDER MARKED PAID'
);

    const product =
      await this.videosService.findOne(
        order.productId,
      );

    // =====================================
// CREATOR SHARE
// =====================================

const creatorShare =
  Number(order.creatorAmount);
    // CREDIT CREATOR
    await this.walletsService.creditWallet(
      product.creatorId,
      creatorShare,
    );

    // ADD TO LIBRARY
    if (
      product.type === 'ebook'
    ) {

      console.log(
  'ADDING TO LIBRARY',
  order.buyerId,
  product.id,
);

console.log(
  'ABOUT TO INSERT LIBRARY',
  order.buyerId,
  product.id,
);


      await this.libraryService.addToLibrary(
        order.buyerId,
        product.id,
      );

      console.log(
  'LIBRARY INSERT COMPLETE'
);

    }

    return {

      success: true,

      message:
        'Payment verified',

    };

  }

  async handleWebhook(
  payload: any,
  signature: string,
) {

  const hash =
    crypto
      .createHmac(
        'sha512',
        this.PAYSTACK_SECRET,
      )
      .update(
        JSON.stringify(payload),
      )
      .digest('hex');

  if (hash !== signature) {

    return {
      success: false,
    };

  }

  if (
    payload.event ===
    'charge.success'
  ) {

    const reference =
      payload.data.reference;

    const orderId =
      Number(
        payload.data.metadata.orderId,
      );

    await this.verifyMarketPayment(
      reference,
    );

  }

  return {
    success: true,
  };

}

}