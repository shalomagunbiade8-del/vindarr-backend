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
    orderId: number,
  ) {

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

    if (
      data.data.status !== 'success'
    ) {

      throw new BadRequestException(
        'Payment failed',
      );

    }

    const order =
      await this.ordersService.findById(
        orderId,
      );

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
      };

    }

    if (
      data.data.amount !==
      Number(order.amount) * 100
    ) {

      throw new BadRequestException(
        'Amount mismatch',
      );

    }

    await this.ordersService
      .markOrderAsPaid(
        order.id,
        reference,
      );

    const product =
      await this.videosService.findOne(
        order.productId,
      );

    // =====================================
    // CREATOR SHARE
    // =====================================

    let creatorShare = 0;

    if (product.type === 'ebook') {

      creatorShare =
        Number(product.price) * 0.6;

    }

    else if (
      product.type === 'fashion'
    ) {

      creatorShare =
        Number(product.price) * 0.7;

    }

    else {

      creatorShare =
        Number(product.price) * 0.7;

    }

    // CREDIT CREATOR
    await this.walletsService.creditWallet(
      product.creatorId,
      creatorShare,
    );

    // ADD TO LIBRARY
    if (
      product.type === 'ebook'
    ) {

      await this.libraryService.addToLibrary(
        order.buyerId,
        product.id,
      );

    }

    return {

      success: true,

      message:
        'Payment verified',

    };

  }

}