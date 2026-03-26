import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';

import { User } from '../users/user.entity';
import { OneToMany } from 'typeorm';
import { Comment } from '../comments/comment.entity'; 

@Entity()
export class Video {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  category: string;

  @Column()
  context: string;

  @Column()
  videoUrl: string;

  @Column('int', { default: 0 })
  understandCount: number;

  @ManyToOne(() => User)
  creator: User;

  @Column()
  creatorId: number;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Comment, comment => comment.video)
comments: Comment[];
} 
