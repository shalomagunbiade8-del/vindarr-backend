import { Module } from '@nestjs/common';
import { PurviewService } from './purview.service';
import { PurviewController } from './purview.controller';

@Module({
  providers: [PurviewService],
  controllers: [PurviewController]
})
export class PurviewModule {}
