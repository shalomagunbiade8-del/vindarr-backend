import {
  Module,
} from '@nestjs/common';

import {
  TypeOrmModule,
} from '@nestjs/typeorm';

import {
  Poll,
} from './poll.entity';

import {
  PollOption,
} from '../poll-option/poll-option.entity';

import {
  PollVote,
} from '../poll-vote/poll-vote.entity';

import {
  User,
} from '../users/user.entity';

import {
  PollController,
} from './poll.controller';

import {
  PollService,
} from './poll.service';

@Module({

  imports: [

    TypeOrmModule.forFeature([

      Poll,

      PollOption,

      PollVote,

      User,

    ]),

  ],

  controllers: [
    PollController,
  ],

  providers: [
    PollService,
  ],

  exports: [
    PollService,
  ],

})
export class PollModule {}