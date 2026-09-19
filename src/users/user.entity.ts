import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';

import { Comment } from '../comments/comment.entity';
import { Find } from '../find/find.entity';
import { FindReply } from '../find-reply/find-reply.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column({
    type: 'varchar',
    nullable: true,
    select: false,
  })
  password: string | null;

  // Google account ID.
  // Nullable because normal email/password users
  // do not necessarily have Google linked.
  @Column({
    type: 'varchar',
    nullable: true,
    unique: true,
  })
  googleId: string | null;

  @Column({ default: 'learner' })
  role: string;

  
@Column({
  type: 'varchar',
  nullable: true,
})
avatar: string | null;



  @Column({
  type: 'varchar',
  nullable: true,
})
bio: string | null;

  @Column({ default: 0 })
  totalUnderstand: number;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(
    () => Comment,
    comment => comment.author,
  )
  comments: Comment[];

  // Bank details for coaches
  @Column({ nullable: true })
  bankName: string;

  @Column({ nullable: true })
  accountNumber: string;

  @Column({ nullable: true })
  accountName: string;

  @Column({ default: 0 })
  purviewCount: number;

  @Column({ default: true })
  emailNotifications: boolean;

  @OneToMany(
    () => Find,
    find => find.creator,
  )
  finds: Find[];

  @OneToMany(
    () => FindReply,
    reply => reply.creator,
  )
  findReply: FindReply[];
}