import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';

import { User } from '../users/user.entity';
import { Video } from '../videos/video.entity';
import { Story } from '../stories/story.entity';

@Entity()
export class Comment {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  text: string;

  @Column({ default: 0 })
  time: number;

  @Column({ nullable: true })
  parentId?: number;

  // =========================
  // AUTHOR
  // =========================

  @ManyToOne(
    () => User,
    user => user.comments,
  )
  author: User;

  // =========================
  // VIDEO COMMENT
  // =========================

  @ManyToOne(
    () => Video,
    video => video.comments,
    {
      nullable: true,
      onDelete: 'CASCADE',
    },
  )
  video?: Video;

  // =========================
  // STORY COMMENT
  // =========================

  @ManyToOne(
    () => Story,
    {
      nullable: true,
      onDelete: 'CASCADE',
    },
  )
  story?: Story;

  @CreateDateColumn()
createdAt: Date;

}