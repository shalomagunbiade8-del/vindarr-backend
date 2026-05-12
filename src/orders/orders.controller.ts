import {
  Controller,
  Post,
  Body,
  Get,
  Param,
} from '@nestjs/common';

import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {

  constructor(
    private ordersService: OrdersService
  ) {}

  @Post()
  create(@Body() body) {
    return this.ordersService.create(body);
  }

  @Get(':id')
  getOne(@Param('id') id: number) {
    return this.ordersService.findById(id);
  }

  @Get('user/:id')
  getUserOrders(@Param('id') id: number) {
    return this.ordersService.getUserOrders(id);
  }

  @Get('creator/:id')
  getCreatorSales(@Param('id') id: number) {
    return this.ordersService.getCreatorSales(id);
  }
}