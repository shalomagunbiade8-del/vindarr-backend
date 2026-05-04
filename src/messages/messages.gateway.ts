import {
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets';

import { Server } from 'socket.io';

@WebSocketGateway({ cors: true })
export class MessagesGateway {

  @WebSocketServer()
  server: Server;

  sendMessage(message: any) {
    this.server.emit("receiveMessage", message);
  }
}