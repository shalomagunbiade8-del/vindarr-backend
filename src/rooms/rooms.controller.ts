import { Controller, Post, Body, Get } from '@nestjs/common';
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
} 