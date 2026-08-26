import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Unique,
} from 'typeorm';

import { Video } from '../videos/video.entity';

@Entity('saved')
@Unique(['userId', 'contentId'])
export class Saved {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  contentId: number;

  @ManyToOne(
    () => Video,
    {
      onDelete: 'CASCADE',
      nullable: false,
    },
  )
  @JoinColumn({
    name: 'contentId',
  })
  content: Video;

  @CreateDateColumn()
  createdAt: Date;
}