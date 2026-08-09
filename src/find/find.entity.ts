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
import { FindReply } from '../find-reply/find-reply.entity';

@Entity('finds')
export class Find {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 300,
  })
  caption: string;

  @Column({
    type: 'varchar',
    length: 50,
  })
  category: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  location: string | null;

  @Column({
    type: 'text',
  })
  videoUrl: string;

  @Column({
    type: 'int',
    default: 0,
  })
  duration: number;

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
    () => FindReply,
    reply => reply.find,
    {
      cascade: true,
    },
  )
  replies: FindReply[];

  @Column({
    type: 'int',
    default: 0,
  })
  replyCount: number;

  @CreateDateColumn()
  createdAt: Date;
}