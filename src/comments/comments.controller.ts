import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Request,
  UseGuards,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';

import { CommentsService } from './comments.service';

import { CreateCommentDto } from './dto/create-comment.dto';


@Controller('comments')
export class CommentsController {

  constructor(
    private readonly commentsService:
      CommentsService,
  ) {}


  // =====================================
  // CREATE COMMENT / REPLY
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
    @Param('videoId') videoId: string,
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
    @Param('storyId') storyId: string,
  ) {

    return this.commentsService.getStoryComments(
      Number(storyId),
    );

  }

}
