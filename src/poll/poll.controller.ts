import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Body,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';

import {
  AuthGuard,
} from '@nestjs/passport';

import {
  FilesInterceptor,
} from '@nestjs/platform-express';

import {
  v2 as cloudinary,
} from 'cloudinary';

import {
  PollService,
} from './poll.service';

import {
  PollMediaType,
} from '../poll-option/poll-option.entity';

@Controller('polls')
export class PollController {

  constructor(
    private readonly pollService:
      PollService,
  ) {}

  // ==========================================
  // CREATE POLL
  // ==========================================

  @UseGuards(
    AuthGuard('jwt'),
  )
  @Post()
  @UseInterceptors(
    FilesInterceptor(
      'media',
      4,
    ),
  )
  async create(
    @UploadedFiles() files: any[],
    @Body() body: any,
    @Req() req: any,
  ) {

    if (
      !files ||
      files.length < 2
    ) {
      throw new BadRequestException(
        'A poll requires at least 2 media files',
      );
    }

    if (files.length > 4) {
      throw new BadRequestException(
        'A poll can have at most 4 options',
      );
    }

    let captions: string[] = [];

    try {

      captions =
        typeof body.captions === 'string'
          ? JSON.parse(
              body.captions,
            )
          : body.captions || [];

    } catch {

      throw new BadRequestException(
        'Invalid poll captions',
      );

    }

    if (
      !Array.isArray(captions) ||
      captions.length !== files.length
    ) {
      throw new BadRequestException(
        'Each poll media item needs a caption',
      );
    }

    const mediaTypes: PollMediaType[] =
      files.map(
        file =>
          file.mimetype?.startsWith(
            'video/',
          )
            ? PollMediaType.VIDEO
            : PollMediaType.IMAGE,
      );

    const uploadedOptions: Array<{
      caption: string;
      mediaUrl: string;
      mediaType: PollMediaType;
    }> = [];

    for (
      let index = 0;
      index < files.length;
      index++
    ) {

      const file =
        files[index];

      const mediaType =
        mediaTypes[index];

      const mediaUrl =
        await this.uploadMedia(
          file,
          mediaType,
        );

      uploadedOptions.push({

        caption:
          String(
            captions[index] || '',
          ),

        mediaUrl,

        mediaType,

      });
    }

    return this.pollService.create(

      body.question,

      body.category,

      uploadedOptions,

      req.user.userId,

    );
  }

  // ==========================================
  // GET POLLS
  // ==========================================

  @Get()
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 15,
  ) {

    return this.pollService.findAll(
      Number(page),
      Number(limit),
    );
  }

  // ==========================================
  // GET SINGLE POLL
  // ==========================================

  @Get(':id')
  findOne(
    @Param('id') id: string,
  ) {

    return this.pollService.findOne(
      Number(id),
    );
  }

  // ==========================================
  // VOTE
  // ==========================================

  @UseGuards(
    AuthGuard('jwt'),
  )
  @Post(':id/vote')
  async vote(
    @Param('id') id: string,
    @Body() body: any,
    @Req() req: any,
  ) {

    if (!body?.optionId) {

      throw new BadRequestException(
        'optionId is required',
      );

    }

    return this.pollService.vote(

      Number(id),

      Number(body.optionId),

      req.user.userId,

    );
  }

  // ==========================================
  // USER VOTE
  // ==========================================

  @UseGuards(
    AuthGuard('jwt'),
  )
  @Get(':id/my-vote')
  getUserVote(
    @Param('id') id: string,
    @Req() req: any,
  ) {

    return this.pollService.getUserVote(

      Number(id),

      req.user.userId,

    );
  }

  // ==========================================
  // DELETE POLL
  // ==========================================

  @UseGuards(
    AuthGuard('jwt'),
  )
  @Delete(':id')
  delete(
    @Param('id') id: string,
    @Req() req: any,
  ) {

    return this.pollService.delete(

      Number(id),

      req.user.userId,

    );
  }

  // ==========================================
  // CLOUDINARY
  // ==========================================

  private uploadMedia(
    file: any,
    mediaType: PollMediaType,
  ): Promise<string> {

    return new Promise(
      (
        resolve,
        reject,
      ) => {

        const resourceType =
          mediaType === PollMediaType.VIDEO
            ? 'video'
            : 'image';

        const stream =
          cloudinary.uploader.upload_stream(

            {
              resource_type:
                resourceType,

              folder:
                'vindarr_polls',

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
                    'Cloudinary did not return a media URL',
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