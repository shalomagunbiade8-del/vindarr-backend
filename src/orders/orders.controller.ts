import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';

import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {

  constructor(
    private ordersService: OrdersService
  ) {}

  // =====================================
  // CREATE ORDER
  // =====================================

  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(
    @Body() body,
    @Req() req,
  ) {
    return this.ordersService.create(
      body.productId,
      req.user.userId,
    );
  }

  // =====================================
  // MY ORDERS
  // =====================================

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  getMyOrders(@Req() req) {

    return this.ordersService.getUserOrders(
      req.user.userId
    );

  }

  // =====================================
  // MY SALES
  // =====================================

  @UseGuards(AuthGuard('jwt'))
  @Get('creator/me')
  getCreatorSales(@Req() req) {

    return this.ordersService.getCreatorSales(
      req.user.userId
    );

  }

  // =====================================
  // SINGLE ORDER
  // IMPORTANT:
  // KEEP THIS LAST
  // =====================================

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  getOne(@Param('id') id: string) {

    return this.ordersService.findById(
      Number(id)
    );

  }

}