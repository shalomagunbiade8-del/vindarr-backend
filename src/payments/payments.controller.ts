import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post('initialize')
  async initialize(@Body() body: { email: string; amount: number; sessionId: number }) {
    return this.paymentsService.initialize(body.email, body.amount, body.sessionId);
  }

  @Get('verify')
  async verify(@Query('reference') reference: string, @Query('sessionId') sessionId: number) {
    return this.paymentsService.verify(reference, sessionId);
  }

  @Post('order/initialize')
initializeOrder(
  @Body()
  body: {
    email: string;
    amount: number;
    orderId: number;
  }
){
  return this.paymentsService.initializeOrderPayment(
    body.email,
    body.amount,
    body.orderId
  );
}

@Get('order/verify')
verifyOrder(
  @Query('reference') reference: string,
  @Query('orderId') orderId: number
){
  return this.paymentsService.verifyOrderPayment(
    reference,
    orderId
  );
}

} 
