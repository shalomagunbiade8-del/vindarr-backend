import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './message.entity';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import { MessagesGateway } from './messages.gateway';
import { ChatRoom } from '../rooms/chat-room.entity';

@Module({

  imports:[TypeOrmModule.forFeature([Message, ChatRoom])],

  controllers:[MessagesController],

  providers:[MessagesService, MessagesGateway]

})
export class MessagesModule {} 
