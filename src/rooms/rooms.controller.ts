import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { RoomsService } from './rooms.service';

@Controller('rooms')
export class RoomsController {

  constructor(private roomsService: RoomsService) {}

  @Post()
  createRoom(@Body() body) {
    return this.roomsService.createRoom(body);
  }

  @Get()
  getRooms() {
    return this.roomsService.getRooms();
  }

  // ✅ JOIN ROOM
  @Post(':id/join')
  joinRoom(
    @Param('id') id: number,
    @Body() body
  ) {
    return this.roomsService.joinRoom(id, body.username);
  }
} 
