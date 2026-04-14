import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatRoom } from './chat-room.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RoomsService {

  constructor(
    @InjectRepository(ChatRoom)
    private repo: Repository<ChatRoom>
  ) {}

  createRoom(data) {
  const room = this.repo.create({
    name: data.name,
    members: data.members || [],
    description: data.description || ''
  });

  return this.repo.save(room);
} 

  getRooms() {
    return this.repo.find();
  }
} 