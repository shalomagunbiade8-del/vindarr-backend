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
status: string; // pending | accepted | paid | completed 


@Column({ nullable: true })
meetingLink: string; 

  @ManyToOne(() => User)
  @JoinColumn({ name: 'learnerId' })
  learner: User;

  @ManyToOne(() => Coach)
  @JoinColumn({ name: 'coachId' })
  coach: Coach;

} 
