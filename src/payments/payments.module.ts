import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { SessionsModule } from '../sessions/sessions.module';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [SessionsModule, SessionsModule,
  OrdersModule], // 🔥 IMPORTANT
  providers: [PaymentsService],
  controllers: [PaymentsController],
})
export class PaymentsModule {} 
