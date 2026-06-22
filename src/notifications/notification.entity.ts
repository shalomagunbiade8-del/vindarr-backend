import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class Notification {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  title: string;

  @Column('text')
  message: string;

  @Column()
  type: string;

  @Column({
    default: false,
  })
  isRead: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @Column({
  nullable: true,
})
referenceId: string;

@Column({
  nullable: true,
})
link: string;

}