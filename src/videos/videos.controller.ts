import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';

import { VideosService } from './videos.service';

import { FileFieldsInterceptor } from '@nestjs/platform-express';

import { v2 as cloudinary } from 'cloudinary';
import * as streamifier from 'streamifier';

@Controller('videos')
export class VideosController {
  constructor(
    private readonly videosService: VideosService,
  ) {}

  // =====================================
  // UPLOAD CONTENT
  // =====================================

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(
  FileFieldsInterceptor(
    [
      { name: 'file', maxCount: 1 },
      { name: 'cover', maxCount: 1 },
    ],
    {
      limits: {
        fileSize: 1024 * 1024 * 200,
      },
    },
  ),
)


  async uploadContent(
    @UploadedFiles()
    files: {
      file?: any[];
      cover?: any[];
    },

    @Body() body: any,
    @Req() req,
  ) {
    const { type } = body;

    const file = files?.file?.[0];
    const cover = files?.cover?.[0];

    if (!type) {
      throw new BadRequestException(
        'Type is required',
      );
    }

    let fileUrl: string | null = null;
    let coverUrl: string | null = null;
    let videoUrl: string | null = null;

    // =====================================
    // VIDEO
    // =====================================

    if (type === 'video') {
      if (!file) {
        throw new BadRequestException(
          'Video file required',
        );
      }

      videoUrl = await this.uploadToCloudinary(
        file,
        'video',
        'vindarr_videos',
      );
    }

    // =====================================
    // EBOOK
    // =====================================

    if (type === 'ebook') {
      if (!file) {
        throw new BadRequestException(
          'PDF required',
        );
      }

      fileUrl = await this.uploadToCloudinary(
        file,
        'raw',
        'vindarr_ebooks',
      );

      if (cover) {
        coverUrl = await this.uploadToCloudinary(
          cover,
          'image',
          'vindarr_covers',
        );
      }
    }

    // =====================================
    // FASHION
    // =====================================

    if (type === 'fashion') {
      if (!file) {
        throw new BadRequestException(
          'Image/video required',
        );
      }

      fileUrl = await this.uploadToCloudinary(
        file,
        'auto',
        'vindarr_fashion',
      );
    }

    return this.videosService.create(
      {
        ...body,
        type,

        videoUrl,
        fileUrl,
        coverUrl,

        price: body.price
          ? Number(body.price)
          : null,
      },
      req.user.userId,
    );
  }

  // =====================================
  // CLOUDINARY UPLOAD
  // =====================================

  private async uploadToCloudinary(
    file,
    resource_type,
    folder,
  ) {
    return new Promise<string>(
      (resolve, reject) => {
        const stream =
          cloudinary.uploader.upload_stream(
            {
              resource_type,
              folder,
            },
            (error, result) => {
              if (error) {
                return reject(error);
              }

              if (!result) {
                return reject(
                  'Upload failed',
                );
              }

              resolve(result.secure_url);
            },
          );

        streamifier
          .createReadStream(file.buffer)
          .pipe(stream);
      },
    );
  }

  // =====================================
  // GET ALL VIDEOS
  // =====================================

  @Get()
  findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.videosService.findAll(
      Number(page),
      Number(limit),
    );
  }

  // =====================================
  // SEARCH
  // =====================================

  @Get('search')
  searchVideos(
    @Query('q') query: string,
  ) {
    return this.videosService.searchVideos(
      query,
    );
  }

  // =====================================
  // MARKET
  // =====================================

  @Get('market')
  getMarket(
    @Query('type') type: string,
  ) {
    return this.videosService.getMarket(type);
  }

  // =====================================
  // USER POSTS
  // IMPORTANT:
  // MUST COME BEFORE :id
  // =====================================

  @Get('user/:creatorId')
  getVideosByCreator(
    @Param('creatorId') creatorId: string,
  ) {
    return this.videosService.getVideosByCreator(
      Number(creatorId),
    );
  }

  // =====================================
  // SINGLE CONTENT
  // IMPORTANT:
  // KEEP THIS BELOW search/market/user
  // =====================================

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.videosService.findOne(
      Number(id),
    );
  }

  // =====================================
  // DELETE
  // =====================================

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  deleteVideo(
    @Param('id') id: string,
    @Req() req,
  ) {
    return this.videosService.deleteVideo(
      Number(id),
      req.user.userId,
    );
  }

  // =====================================
  // UNDERSTAND
  // =====================================

  @UseGuards(AuthGuard('jwt'))
  @Post(':id/understand')
  pressUnderstand(
    @Param('id') id: string,
    @Req() req,
  ) {
    return this.videosService.pressUnderstand(
      Number(id),
      req.user.userId,
    );
  }
}