import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket
} from '@nestjs/websockets';

import { Server, Socket } from 'socket.io'; 


@WebSocketGateway({ cors: true })
export class MessagesGateway {

  @WebSocketServer()
  server: Server;

  sendMessage(message: any){

  // send ONLY to sender and receiver
  this.server.to(message.receiverUsername).emit("receiveMessage", message);
  this.server.to(message.senderUsername).emit("receiveMessage", message);

}

handleConnection(client: Socket) {

  const username = client.handshake.auth?.username;

  if (username) {
    client.join(username); // 🔥 each user has their own room
    console.log("User connected:", username);
  }

} 

} 