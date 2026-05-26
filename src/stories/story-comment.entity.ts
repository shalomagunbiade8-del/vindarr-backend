import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';

import { User } from '../users/user.entity';
import { Story } from './story.entity';

@Entity()
export class StoryComment {

  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  content: string;

  @ManyToOne(
    () => Story,
    story => story.comments,
    {
      onDelete: 'CASCADE',
    },
  )
  story: Story;

  @ManyToOne(
    () => User,
    {
      eager: true,
      onDelete: 'CASCADE',
    },
  )
  user: User;

  @CreateDateColumn()
  createdAt: Date;

}