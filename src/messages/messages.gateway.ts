import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: true })
export class MessagesGateway {

  @WebSocketServer()
  server: Server;

  sendMessage(msg:any){

    this.server.emit('receiveMessage', msg);

  }

} 