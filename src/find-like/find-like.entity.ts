import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Unique,
} from 'typeorm';

@Entity()
@Unique(['findId', 'userId'])
export class FindLike {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  findId: number;

  @Column()
  userId: number;

  @CreateDateColumn()
  createdAt: Date;

}