import { Controller, Post, Body, Get, Param, Delete, UseInterceptors, UploadedFile } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { FileInterceptor } from '@nestjs/platform-express';
import type { SendMessageDto } from './dto/send-message.dto';

@Controller('messages')
export class MessagesController {

  constructor(private messagesService: MessagesService) {}

  @Post()
  sendMessage(@Body() body: SendMessageDto) {
    return this.messagesService.sendMessage(body);
  }

  @Get('conversation/:user1/:user2')
  getConversation(
    @Param('user1') user1: string,
    @Param('user2') user2: string
  ) {
    return this.messagesService.getConversation(user1, user2);
  }

  @Delete(':id')
  deleteMessage(@Param('id') id: number) {
    return this.messagesService.deleteMessage(id);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', { dest: 'uploads/' }))
  uploadFile(@UploadedFile() file) {
    if (!file) {
      throw new Error("File upload failed - no file received");
    }
    return {
      url: `/uploads/${file.filename}`,
      type: file.mimetype
    };
  }

  @Get('inbox/:username')
  getInbox(@Param('username') username: string) {
    return this.messagesService.getInbox(username);
  }

  @Get('room/:roomId')
getRoomMessages(@Param('roomId') roomId: number) {
  return this.messagesService.getRoomMessages(roomId);
}

}