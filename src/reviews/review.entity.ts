import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Unique,
  Index,
} from 'typeorm';

import { User } from '../users/user.entity';
import { Video } from '../videos/video.entity';

@Entity('reviews')
@Unique(['productId', 'userId'])
export class Review {
  @PrimaryGeneratedColumn()
  id: number;

  // ==========================================
  // PRODUCT
  // ==========================================

  @Index()
  @Column()
  productId: number;

  @ManyToOne(
    () => Video,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({
    name: 'productId',
  })
  product: Video;

  // ==========================================
  // REVIEWER
  // ==========================================

  @Index()
  @Column()
  userId: number;

  @ManyToOne(
    () => User,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({
    name: 'userId',
  })
  user: User;

  // ==========================================
  // RATING
  // ==========================================

  @Column({
    type: 'int',
  })
  rating: number;

  // ==========================================
  // REVIEW
  // ==========================================

  @Column({
    type: 'text',
  })
  comment: string;

  // ==========================================
  // CREATED
  // ==========================================

  @CreateDateColumn()
  createdAt: Date;
}