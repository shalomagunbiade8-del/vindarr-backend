import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { Message } from './message.entity';
import { MessagesGateway } from './messages.gateway';
import type { SendMessageDto } from './dto/send-message.dto'; // ✅ 'import type'

@Injectable()
export class MessagesService {

  constructor(
    @InjectRepository(Message)
    private repo: Repository<Message>,
    private gateway: MessagesGateway
  ) {}

  async sendMessage(data: SendMessageDto, currentUser: any) {

  if (!data.receiverUsername) {
    throw new Error("receiverUsername is required");
  }

  const msg: DeepPartial<Message> = {
    senderUsername: currentUser.username, // ✅ SECURE
    receiverUsername: data.receiverUsername,
    text: data.text ?? undefined,
    attachmentUrl: data.attachmentUrl ?? undefined,
    attachmentType: data.attachmentType ?? undefined
  };

  const saved = await this.repo.save(msg);

  this.gateway.sendMessage(saved);

  return saved;
}

  async getConversation(user1: string, user2: string) {
    return this.repo
      .createQueryBuilder("message")
      .where(
        "(message.senderUsername = :u1 AND message.receiverUsername = :u2)",
        { u1: user1, u2: user2 }
      )
      .orWhere(
        "(message.senderUsername = :u2 AND message.receiverUsername = :u1)",
        { u1: user1, u2: user2 }
      )
      .orderBy("message.createdAt", "ASC")
      .getMany();
  }

 async deleteMessage(id: number, currentUser: any) {

  const msg = await this.repo.findOne({ where: { id } });

  if (!msg) throw new Error("Message not found");

  if (msg.senderUsername !== currentUser.username) {
    throw new Error("Not allowed");
  }

  return this.repo.delete(id);
}

  async getInbox(username: string) {

  const messages = await this.repo
    .createQueryBuilder("message")
    .where(
      "message.senderUsername = :u OR message.receiverUsername = :u",
      { u: username }
    )
    .orderBy("message.createdAt", "DESC")
    .getMany();

  const map = new Map();

  messages.forEach(m => {

    const otherUser =
      m.senderUsername === username
        ? m.receiverUsername
        : m.senderUsername;

    if (!otherUser) return;

    if (!map.has(otherUser)) {
      map.set(otherUser, m); // latest message
    }
  });

  return Array.from(map.values());
} 

}