import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Request,
  UseGuards,
} from '@nestjs/common';

import { CommentsService } from './comments.service';

import { CreateCommentDto } from './dto/create-comment.dto';

import { AuthGuard } from '@nestjs/passport';

@Controller('comments')
export class CommentsController {

  constructor(
    private commentsService: CommentsService,
  ) {}

  // =====================================
  // CREATE COMMENT
  // =====================================

  @UseGuards(AuthGuard('jwt'))
  @Post()
  createComment(
    @Body() dto: CreateCommentDto,
    @Request() req,
  ) {

    return this.commentsService.create(
      dto,
      req.user,
    );

  }

  // =====================================
  // VIDEO COMMENTS
  // =====================================

  @Get('video/:videoId')
  getVideoComments(
    @Param('videoId') videoId: number,
  ) {

    return this.commentsService.getVideoComments(
      Number(videoId),
    );

  }

  // =====================================
  // STORY COMMENTS
  // =====================================

  @Get('story/:storyId')
  getStoryComments(
    @Param('storyId') storyId: number,
  ) {

    return this.commentsService.getStoryComments(
      Number(storyId),
    );

  }

}