import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Unique,
} from 'typeorm';

@Entity('saving_streaks')
@Unique(['userId'])
export class SavingStreak {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column({
    default: 0,
  })
  currentStreak: number;

  @Column({
    default: 0,
  })
  longestStreak: number;

  @Column({
    type: 'varchar',
    length: 10,
    nullable: true,
  })
  lastSavedDate: string | null;
}