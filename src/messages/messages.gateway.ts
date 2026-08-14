import {
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

import {
  Server,
} from 'socket.io';


@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class MessagesGateway {

  @WebSocketServer()
  server: Server;


  // ==========================================
  // NEW MESSAGE
  // ==========================================

  sendMessage(
    message: any,
  ) {

    if (!this.server) {
      return;
    }

    this.server.emit(
      'receiveMessage',
      message,
    );
  }


  // ==========================================
  // MESSAGE DELETED
  // ==========================================

  messageDeleted(
    messageId: number,
  ) {

    if (!this.server) {
      return;
    }

    this.server.emit(
      'messageDeleted',
      {
        id: messageId,
      },
    );
  }
}