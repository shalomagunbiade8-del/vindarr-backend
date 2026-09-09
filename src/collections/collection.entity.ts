import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Unique,
} from 'typeorm';

import { User } from '../users/user.entity';
import { CollectionItem } from './collection-item.entity';


@Entity('collections')
@Unique(['shareToken'])
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
    type: 'text',
    nullable: true,
  })
  coverUrl: string | null;


  /*
   * Public identifier used when someone shares
   * a collection.
   *
   * Do NOT expose the database ID as the public
   * share identifier.
   */

  @Column({
    type: 'varchar',
    length: 48,
    nullable: true,
  })
  shareToken: string | null;


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