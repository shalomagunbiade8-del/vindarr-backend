import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FindController } from './find.controller';
import { FindService } from './find.service';

import { Find } from './find.entity';
import { FindReply } from '../find-reply/find-reply.entity';

import { User } from '../users/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Find,
      FindReply,
      User,
    ]),
  ],

  controllers: [
    FindController,
  ],

  providers: [
    FindService,
  ],

  exports: [
    FindService,
  ],
})
export class FindModule {}