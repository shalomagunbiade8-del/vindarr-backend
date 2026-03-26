import { Controller, Post, Body, Get, Param, Request } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Controller('comments')
export class CommentsController {

  constructor(private commentsService: CommentsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  createComment(
    @Body() dto: CreateCommentDto,
    @Request() req
  ) {
    return this.commentsService.create(dto, req.user);
  }

  @Get(':videoId')
  getComments(@Param('videoId') videoId: number) {
    return this.commentsService.getVideoComments(videoId);
  }

} 