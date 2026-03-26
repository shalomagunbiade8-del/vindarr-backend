import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Coach } from './coach.entity';
import { CoachesService } from './coaches.service';
import { CoachesController } from './coaches.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Coach])],
  providers: [CoachesService],
  controllers: [CoachesController],
})
export class CoachesModule {} 