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
    return this.repo.save(data);
  }

  getRooms() {
    return this.repo.find();
  }
} 