import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { Coach } from '../coaches/coach.entity';

@Entity()
export class Session {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  learnerId: number;

  @Column()
  coachId: number;

  @Column()
  date: string;

  @Column()
  time: string;

  @Column({ default: 'pending' })
status: string; // pending | accepted | rejected | completed

@Column({ default: 'unpaid' })
paymentStatus: string; // unpaid | paid 


@Column({ type: 'text', nullable: true })
meetingLink: string | null; 

  @ManyToOne(() => User)
  @JoinColumn({ name: 'learnerId' })
  learner: User;

  @ManyToOne(() => Coach)
  @JoinColumn({ name: 'coachId' })
  coach: Coach;

} 
