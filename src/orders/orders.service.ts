import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Order } from './order.entity';

import { Video } from '../videos/video.entity';

import { User } from '../users/user.entity';

@Injectable()

export class OrdersService {

  constructor(

    @InjectRepository(Order)
    private orderRepository: Repository<Order>,

    @InjectRepository(Video)
    private videoRepository: Repository<Video>,

    @InjectRepository(User)
    private userRepository: Repository<User>,

  ) {}

  // =====================================
  // CREATE ORDER
  // =====================================

  async create(
    productId: number,
    buyerId: number,
  ) {

    // PRODUCT
    const product =
      await this.videoRepository.findOne({
        where: { id: productId },
      });

    if (!product) {

      throw new NotFoundException(
        'Product not found',
      );

    }

    // BUYER
    const buyer =
      await this.userRepository.findOne({
        where: { id: buyerId },
      });

    if (!buyer) {

      throw new NotFoundException(
        'Buyer not found',
      );

    }

    // NO SELF PURCHASE
    if (
      product.creatorId === buyerId
    ) {

      throw new BadRequestException(
        'Cannot buy your own product',
      );

    }

    // SPLIT
    let platformPercent = 30;

    // EBOOK
    if (
      product.type === 'ebook'
    ) {

      platformPercent = 40;

    }

    const amount =
      Number(product.price);

    const platformAmount =
      (amount * platformPercent) / 100;

    const creatorAmount =
      amount - platformAmount;

    // CREATE ORDER
    const order =
      this.orderRepository.create({

        buyerId,

        creatorId:
          product.creatorId,

        productId:
          product.id,

        productType:
          product.type,

        amount,

        creatorAmount,

        platformAmount,

        paymentStatus:
          'pending',

      });

    return this.orderRepository.save(
      order,
    );

  }

  // =====================================
  // FIND ORDER
  // =====================================

  async findById(id: number) {

    const order =
      await this.orderRepository.findOne({
        where: { id },
      });

    if (!order) {

      throw new NotFoundException(
        'Order not found',
      );

    }

    return order;

  }

  // =====================================
  // MARK PAID
  // =====================================

  async markOrderAsPaid(
    orderId: number,
    reference: string,
  ) {

    const order =
      await this.findById(orderId);

    order.paymentStatus = 'paid';

    order.reference = reference;

    return this.orderRepository.save(
      order,
    );

  }

  // =====================================
  // USER PURCHASES
  // =====================================

  async getUserOrders(userId: number) {

    return this.orderRepository.find({

      where: {
        buyerId: userId,
      },

      order: {
        id: 'DESC',
      },

    });

  }

  // =====================================
  // CREATOR SALES
  // =====================================

  async getCreatorSales(
    creatorId: number,
  ) {

    return this.orderRepository.find({

      where: {

        creatorId,

        paymentStatus: 'paid',

      },

      order: {
        id: 'DESC',
      },

    });

  }

}