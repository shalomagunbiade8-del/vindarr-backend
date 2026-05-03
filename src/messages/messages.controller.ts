import { Controller, Post, Body, Get, Param, Delete, UseInterceptors, UploadedFile, Req, UseGuards} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { FileInterceptor } from '@nestjs/platform-express';
import type { SendMessageDto } from './dto/send-message.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('messages')
export class MessagesController {

  constructor(private messagesService: MessagesService) {}

 @Post()
@UseGuards(AuthGuard) // ✅ add your auth guard
sendMessage(@Req() req, @Body() body: SendMessageDto) {
  return this.messagesService.sendMessage(body, req.user);
}

  @Get('conversation/:user1/:user2')
  getConversation(
    @Param('user1') user1: string,
    @Param('user2') user2: string
  ) {
    return this.messagesService.getConversation(user1, user2);
  }

  @Delete(':id')
@UseGuards(AuthGuard)
deleteMessage(@Param('id') id: number, @Req() req) {
  return this.messagesService.deleteMessage(Number(id), req.user);
}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
  dest: 'uploads/',
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
}))
  uploadFile(@UploadedFile() file) {

    if (!file) {
      throw new Error("File upload failed - no file received");
    }

    if (
  !file.mimetype.startsWith("image/") &&
  file.mimetype !== "application/pdf"
) {
  throw new Error("Only images and PDFs allowed");
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

}