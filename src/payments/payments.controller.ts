import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  UseGuards,
  Req,
  Headers,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';

import { PaymentsService } from './payments.service';

@Controller('payments')

export class PaymentsController {

  constructor(
    private paymentsService: PaymentsService,
  ) {}

  // =====================================
  // INITIALIZE MARKET PAYMENT
  // =====================================

  @UseGuards(AuthGuard('jwt'))
  @Post('market/initialize')

  initializeMarketPayment(
    @Body()
    body: {
      productId: number;
    },

    @Req() req,
  ) {

    return this.paymentsService
      .initializeMarketPayment(

        body.productId,

        req.user.userId,

      );

  }

  // =====================================
  // VERIFY MARKET PAYMENT
  // =====================================

  @UseGuards(AuthGuard('jwt'))
 @Get('market/verify')
verifyMarketPayment(

  @Query('reference')
  reference: string,

) {

  return this.paymentsService
    .verifyMarketPayment(
      reference,
    );

}


@Post('webhook')
paystackWebhook(
  @Body() body: any,
  @Headers('x-paystack-signature')
  signature: string,
) {
  return this.paymentsService
    .handleWebhook(
      body,
      signature,
    );
}

}