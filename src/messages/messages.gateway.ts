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

  sendMessage(message:any){

  if (message.roomId) {
    this.server.to("room_" + message.roomId).emit("receiveMessage", message);
  } else {
    this.server.emit("receiveMessage", message); // fallback for 1–1
  }

} 

  handleConnection(socket) {

  socket.on("joinRoom", (roomId) => {
    socket.join(`room_${roomId}`);
  });

} 

@SubscribeMessage('joinRoom')
handleJoinRoom(
  @ConnectedSocket() client: Socket,
  @MessageBody() roomId: number
){
  client.join("room_" + roomId);
} 
 

} 