import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';

import { User } from '../users/user.entity';
import { StoryComment } from './story-comment.entity';

@Entity()
export class Story {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('text')
  content: string;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ nullable: true })
  avatar: string;

  @Column()
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(
    () => StoryComment,
    comment => comment.story
  )
  comments: StoryComment[];

  @Column('int', {
    array: true,
    default: []
  })
  likedBy: number[];

  @CreateDateColumn()
  createdAt: Date;
}
