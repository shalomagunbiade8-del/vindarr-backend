import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Order } from './order.entity';

@Injectable()
export class OrdersService {

  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
  ) {}

  async create(data: Partial<Order>) {

    const order = this.orderRepository.create({
      ...data,
      paymentStatus: 'pending',
    });

    return this.orderRepository.save(order);
  }

  async findById(id: number) {

    const order = await this.orderRepository.findOne({
      where: { id }
    });

    if(!order){
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async markOrderAsPaid(orderId: number, reference: string) {

    const order = await this.findById(orderId);

    order.paymentStatus = 'paid';
    order.reference = reference;

    return this.orderRepository.save(order);
  }

  async getUserOrders(userId: number) {

    return this.orderRepository.find({
      where: { buyerId: userId },
      order: { id: 'DESC' }
    });
  }

  async getCreatorSales(creatorId: number) {

    return this.orderRepository.find({
      where: {
        creatorId,
        paymentStatus: 'paid'
      },
      order: { id: 'DESC' }
    });
  }
}