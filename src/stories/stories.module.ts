import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Story } from './story.entity';
import { StoriesService } from './stories.service';
import { StoriesController } from './stories.controller';
import { User } from '../users/user.entity'; 

@Module({
  imports: [TypeOrmModule.forFeature([Story, User])],
  controllers: [StoriesController],
  providers: [StoriesService],
})
export class StoriesModule {}