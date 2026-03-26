import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { SessionsModule } from '../sessions/sessions.module';

@Module({
  imports: [SessionsModule], // 🔥 IMPORTANT
  providers: [PaymentsService],
  controllers: [PaymentsController],
})
export class PaymentsModule {} 
