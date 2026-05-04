import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class Message {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  senderUsername: string;

  @Column()
  receiverUsername: string;

  @Column({ type: 'text', nullable: true })
  text: string;

  @Column({ nullable: true })
  attachmentUrl: string;

  @Column({ nullable: true })
  attachmentType: string;

  @CreateDateColumn()
  createdAt: Date;
}