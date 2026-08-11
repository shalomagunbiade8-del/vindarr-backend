import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';

import { User } from '../users/user.entity';
import { PollOption } from '../poll-option/poll-option.entity';

@Entity('polls')
export class Poll {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 300,
  })
  question: string;

  @Column({
    type: 'varchar',
    length: 50,
  })
  category: string;

  @Index()
  @Column()
  creatorId: number;

  @ManyToOne(
    () => User,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({
    name: 'creatorId',
  })
  creator: User;

  @OneToMany(
    () => PollOption,
    option => option.poll,
    {
      cascade: true,
      eager: false,
    },
  )
  options: PollOption[];

  @Column({
    type: 'int',
    default: 0,
  })
  totalVotes: number;

  @CreateDateColumn()
  createdAt: Date;
}