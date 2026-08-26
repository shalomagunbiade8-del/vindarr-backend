import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

@Entity('collection_streaks')
@Unique(['userId'])
export class CollectionStreak {

  @PrimaryGeneratedColumn()
  id: number;


  @Column()
  userId: number;


  @Column({
    type: 'int',
    default: 0,
  })
  currentStreak: number;


  @Column({
    type: 'int',
    default: 0,
  })
  longestStreak: number;


  @Column({
    type: 'date',
    nullable: true,
  })
  lastCollectionDate: string | null;


  @UpdateDateColumn()
  updatedAt: Date;

}