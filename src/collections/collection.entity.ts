import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';

import { User } from '../users/user.entity';
import { CollectionItem } from './collection-item.entity';

@Entity('collections')
export class Collection {

  @PrimaryGeneratedColumn()
  id: number;


  @Column()
  userId: number;


  @Column({
    length: 80,
  })
  name: string;


  @Column({
    nullable: true,
  })
  coverUrl: string | null;


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


  @OneToMany(
    () => CollectionItem,
    item =>
      item.collection,
    {
      cascade: true,
    },
  )
  items: CollectionItem[];


  @CreateDateColumn()
  createdAt: Date;


  @UpdateDateColumn()
  updatedAt: Date;

}