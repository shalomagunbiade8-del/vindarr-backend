import { Entity, Column, PrimaryGeneratedColumn,  CreateDateColumn, } from 'typeorm';
import { OneToMany } from 'typeorm';
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

  @CreateDateColumn()
createdAt: Date;

  @OneToMany(() => Comment, comment => comment.author)
comments: Comment[]; 

// bank details for coaches
@Column({ nullable: true })
bankName: string;

@Column({ nullable: true })
accountNumber: string;

@Column({ nullable: true })
accountName: string;

@Column({ default: 0 })
purviewCount: number;

@Column({
default:true,
})
emailNotifications:boolean;

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
