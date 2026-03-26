import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../users/user.entity';
import { Video } from '../videos/video.entity';

@Entity()
export class Comment {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  text: string;

  @Column()
  time: number;

  @Column({ nullable: true })
  parentId?: number;

  @ManyToOne(() => User, user => user.comments)
  author: User;

  @ManyToOne(() => Video, video => video.comments)
  video: Video;

} 