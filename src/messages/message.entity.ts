import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column()
  senderUsername: string;

  @Index()
  @Column()
  receiverUsername: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  text: string | null;

  @Column({
    nullable: true,
  })
  attachmentUrl: string | null;

  @Column({
    nullable: true,
  })
  attachmentType: string | null;

  /*
   * If this message is a reply to another message,
   * this contains the original message ID.
   */
  @Index()
  @Column({
    nullable: true,
  })
  replyToId: number | null;

  /*
   * Self-reference.
   *
   * We do NOT need a separate reply entity.
   */
  @ManyToOne(
    () => Message,
    {
      nullable: true,
      onDelete: 'SET NULL',
    },
  )
  @JoinColumn({
    name: 'replyToId',
  })
  replyTo: Message | null;

  @CreateDateColumn()
  createdAt: Date;
}