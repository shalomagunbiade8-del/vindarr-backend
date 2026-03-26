import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { OneToMany } from 'typeorm';
import { Comment } from '../comments/comment.entity'; 



@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column({ unique: true })
  email: string;

  @Column({select:false})
  password: string;

  @Column({ default: 'learner' })
  role: string;

  @Column({ nullable: true })
avatar: string;

@Column({ nullable: true })
bio: string;

@Column({ default: 0 })
  totalUnderstand: number;

  @OneToMany(() => Comment, comment => comment.author)
comments: Comment[]; 

}
