import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class Withdrawal {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column({
    type: 'decimal',
  })
  amount: number;

  @Column({
    default: 'pending',
  })
  status: string;

  @Column({
    nullable: true,
  })
  bankName: string;

  @Column({
    nullable: true,
  })
  accountNumber: string;

  @Column({
    nullable: true,
  })
  accountName: string;

  @CreateDateColumn()
  createdAt: Date;
}