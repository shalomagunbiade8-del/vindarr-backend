import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class Message {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  senderUsername: string;

  // ✅ KEEP for 1–1 chat
  @Column({ nullable: true })
  receiverUsername: string;

  // ✅ ADD for group chat
  @Column({ nullable: true })
  roomId: number;

  @Column({ type:'text', nullable:true })
  text: string;

  @Column({ nullable:true })
  attachmentUrl: string;

  @Column({ nullable:true })
  attachmentType: string;

  @CreateDateColumn()
  createdAt: Date;
} 
