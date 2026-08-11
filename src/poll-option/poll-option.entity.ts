import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';

import { Poll } from '../poll/poll.entity';
import { PollVote } from '../poll-vote/poll-vote.entity';

export enum PollMediaType {
  IMAGE = 'image',
  VIDEO = 'video',
}

@Entity('poll_options')
export class PollOption {

  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column()
  pollId: number;

  @ManyToOne(
    () => Poll,
    poll => poll.options,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({
    name: 'pollId',
  })
  poll: Poll;

  @Column({
    type: 'varchar',
    length: 200,
  })
  caption: string;

  @Column({
    type: 'text',
  })
  mediaUrl: string;

  @Column({
    type: 'enum',
    enum: PollMediaType,
  })
  mediaType: PollMediaType;

  @Column({
    type: 'int',
    default: 0,
  })
  voteCount: number;

  @OneToMany(
    () => PollVote,
    vote => vote.option,
    {
      cascade: true,
    },
  )
  votes: PollVote[];
}