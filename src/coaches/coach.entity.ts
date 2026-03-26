import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';

@Entity()
export class Coach {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  bio: string;

  @Column({ default: false })
  verified: boolean;

  @Column({ nullable: true })
  expertise: string;

  @Column({ nullable: true })
  hourlyRate: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId'})
  user: User;

  @Column()
  userId: number;

} 
