import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';

import { User } from '../users/user.entity';
import { Poll } from '../poll/poll.entity';
import { PollOption } from '../poll-option/poll-option.entity';

@Entity('poll_votes')
@Index(
  'IDX_POLL_VOTE_USER_POLL',
  [
    'userId',
    'pollId',
  ],
  {
    unique: true,
  },
)
export class PollVote {

  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column()
  pollId: number;

  @ManyToOne(
    () => Poll,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({
    name: 'pollId',
  })
  poll: Poll;

  @Index()
  @Column()
  optionId: number;

  @ManyToOne(
    () => PollOption,
    option => option.votes,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({
    name: 'optionId',
  })
  option: PollOption;

  @Index()
  @Column()
  userId: number;

  @ManyToOne(
    () => User,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({
    name: 'userId',
  })
  user: User;

  @CreateDateColumn()
  createdAt: Date;
}