import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class ChatRoom {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column("simple-array")
  members: string[]; // usernames

  @Column({ nullable: true })
description: string;
} 