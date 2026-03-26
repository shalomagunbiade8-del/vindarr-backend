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
} 
