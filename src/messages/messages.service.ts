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

  async sendMessage(data: SendMessageDto) {

  if (!data.senderUsername) {
    throw new Error("senderUsername is required");
  }

  // ✅ must be either private OR group
  if (!data.receiverUsername && !data.roomId) {
    throw new Error("Either receiverUsername or roomId is required");
  }

  const msg: DeepPartial<Message> = {
    senderUsername: data.senderUsername,
    receiverUsername: data.receiverUsername || undefined,
roomId: data.roomId || undefined, 
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

  async deleteMessage(id: number) {
    return this.repo.delete(id);
  }

  async getInbox(username: string) {
    return this.repo
      .createQueryBuilder("message")
      .where(
        "message.senderUsername = :u OR message.receiverUsername = :u",
        { u: username }
      )
      .orderBy("message.createdAt", "DESC")
      .getMany();
  }

  async getRoomMessages(roomId: number) {
  return this.repo.find({
    where: { roomId },
    order: { createdAt: 'ASC' }
  });
} 

}