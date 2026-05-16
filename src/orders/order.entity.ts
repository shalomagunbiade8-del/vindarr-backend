import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { User } from '../users/user.entity';
import { CreateDateColumn } from 'typeorm';

@Entity()
export class Order {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  buyerId: number;

  @Column()
  creatorId: number;

  @Column()
  productId: number;

  @Column()
  productType: string;

  @Column({ type: 'decimal', default: 0 })
  amount: number;

  @Column({ default: 'pending' })
  paymentStatus: string;

  @Column({ nullable: true })
  reference: string;

  @Column({ default: false })
  paidOut: boolean;

  @Column({ type: 'timestamp', nullable: true })
  paidOutAt: Date;

  @Column({ type: 'decimal', default: 0 })
  creatorAmount: number;

  @Column({ type: 'decimal', default: 0 })
  platformAmount: number;

  @Column({ default: false })
  delivered: boolean;

  @Column({ default: false })
  downloaded: boolean;

  @Column({ nullable: true })
paymentMethod: string;

@CreateDateColumn()
createdAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'buyerId' })
  buyer: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'creatorId' })
  creator: User;
}