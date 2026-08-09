import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';

import {
  FileInterceptor,
} from '@nestjs/platform-express';

import { v2 as cloudinary } from 'cloudinary';

import { FindService } from './find.service';

import { CreateFindDto } from './dto/create-find.dto';
import { CreateFindReplyDto } from '../find-reply/dto/create-find-reply.dto';

@Controller('find')
export class FindController {

  constructor(
    private readonly findService:
      FindService,
  ) {}

  // ==========================================
  // CREATE FIND
  // ==========================================

  @UseGuards(
    AuthGuard('jwt'),
  )
  @Post()
  @UseInterceptors(
    FileInterceptor('video'),
  )
  async create(
    @UploadedFile() file: any,
    @Body() body: any,
    @Req() req: any,
  ) {

    if (!file) {

      throw new BadRequestException(
        'Find video is required',
      );

    }

    const videoUrl =
      await this.uploadVideo(
        file,
        'vindarr_find',
      );

    const dto: CreateFindDto = {

      caption:
        body.caption || '',

      category:
        body.category || '',

      location:
        body.location || undefined,

      videoUrl,

      duration:
        Number(body.duration) || 0,

    };

    return this.findService.create(
      dto,
      req.user.userId,
    );
  }

  // ==========================================
  // FIND FEED
  // ==========================================

  @Get()
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 15,
  ) {

    return this.findService.findAll(
      Number(page),
      Number(limit),
    );
  }

  // ==========================================
  // SINGLE FIND
  // ==========================================

  @Get(':id')
  async findOne(
    @Param('id') id: string,
  ) {

    return this.findService.findOne(
      Number(id),
    );
  }

  // ==========================================
  // CREATE VIDEO REPLY
  // ==========================================

  @UseGuards(
    AuthGuard('jwt'),
  )
  @Post(':id/replies')
  @UseInterceptors(
    FileInterceptor('video'),
  )
  async createReply(
    @Param('id') id: string,
    @UploadedFile() file: any,
    @Body() body: any,
    @Req() req: any,
  ) {

    if (!file) {

      throw new BadRequestException(
        'Reply video is required',
      );

    }

    const videoUrl =
      await this.uploadVideo(
        file,
        'vindarr_find_replies',
      );

    const dto:
      CreateFindReplyDto = {

      videoUrl,

      duration:
        Number(body.duration) || 0,

    };

    return this.findService.createReply(
      Number(id),
      dto,
      req.user.userId,
    );
  }

  // ==========================================
  // GET REPLIES
  // ==========================================

  @Get(':id/replies')
  async getReplies(
    @Param('id') id: string,
  ) {

    return this.findService.getReplies(
      Number(id),
    );
  }

  // ==========================================
  // DELETE FIND
  // ==========================================

  @UseGuards(
    AuthGuard('jwt'),
  )
  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @Req() req: any,
  ) {

    return this.findService.delete(
      Number(id),
      req.user.userId,
    );
  }

  // ==========================================
  // DELETE REPLY
  // ==========================================

  @UseGuards(
    AuthGuard('jwt'),
  )
  @Delete('replies/:replyId')
  async deleteReply(
    @Param('replyId') replyId: string,
    @Req() req: any,
  ) {

    return this.findService.deleteReply(
      Number(replyId),
      req.user.userId,
    );
  }

  // ==========================================
  // CLOUDINARY VIDEO UPLOAD
  // ==========================================

  private uploadVideo(
    file: any,
    folder: string,
  ): Promise<string> {

    return new Promise(
      (resolve, reject) => {

        const stream =
          cloudinary.uploader.upload_stream(

            {
              resource_type: 'video',
              folder,
            },

            (
              error,
              result,
            ) => {

              if (error) {

                return reject(
                  error,
                );

              }

              if (
                !result?.secure_url
              ) {

                return reject(
                  new Error(
                    'Cloudinary did not return a video URL',
                  ),
                );

              }

              resolve(
                result.secure_url,
              );

            },
          );

        stream.end(
          file.buffer,
        );
      },
    );
  }
}