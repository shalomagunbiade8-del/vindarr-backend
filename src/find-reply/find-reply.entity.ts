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
import { Find } from '../find/find.entity';

@Entity('find_replies')
export class FindReply {

  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column()
  findId: number;

  @ManyToOne(
    () => Find,
    find => find.replies,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({
    name: 'findId',
  })
  find: Find;

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

  @Column({
    type: 'text',
  })
  videoUrl: string;

  @Column({
    type: 'int',
    default: 0,
  })
  duration: number;

  @CreateDateColumn()
  createdAt: Date;
}