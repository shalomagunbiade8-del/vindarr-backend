import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  Query,
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';

import {
  AuthGuard,
} from '@nestjs/passport';

import {
  VideosService,
} from './videos.service';


@Controller('videos')
export class VideosController {

  constructor(
    private readonly videosService:
      VideosService,
  ) {}


  // ==========================================
  // CREATE CONTENT
  // ==========================================

  @UseGuards(
    AuthGuard('jwt'),
  )
  @Post()
  async createContent(
    @Body() body: any,
    @Req() req: any,
  ) {

    const type =
      String(
        body?.type || '',
      ).trim();


    if (!type) {

      throw new BadRequestException(
        'Type is required',
      );

    }


    const allowedTypes = [
      'video',
      'ebook',
      'fashion',
      'essential',
    ];


    if (
      !allowedTypes.includes(
        type,
      )
    ) {

      throw new BadRequestException(
        'Invalid content type',
      );

    }


    const title =
      String(
        body?.title || '',
      ).trim();


    const context =
      String(
        body?.context || '',
      ).trim();


    const category =
      String(
        body?.category || '',
      ).trim();


    if (!title) {

      throw new BadRequestException(
        'Title is required',
      );

    }


    if (!context) {

      throw new BadRequestException(
        'Description is required',
      );

    }


    if (!category) {

      throw new BadRequestException(
        'Category is required',
      );

    }


    if (
      type === 'video' &&
      !body.videoUrl
    ) {

      throw new BadRequestException(
        'Uploaded video URL is required',
      );

    }


    if (
      type === 'ebook' &&
      !body.fileUrl
    ) {

      throw new BadRequestException(
        'Uploaded ebook URL is required',
      );

    }


    if (
      type === 'ebook' &&
      !body.coverUrl
    ) {

      throw new BadRequestException(
        'Uploaded ebook cover URL is required',
      );

    }


    if (
      (
        type === 'fashion' ||
        type === 'essential'
      ) &&
      !body.fileUrl
    ) {

      throw new BadRequestException(
        'Uploaded product media URL is required',
      );

    }


    return this.videosService.create(

      {

        title,

        context,

        category,

        type,

        videoUrl:
          body.videoUrl ||
          null,

        fileUrl:
          body.fileUrl ||
          null,

        coverUrl:
          body.coverUrl ||
          null,

        price:
          body.price ??
          0,

      },

      req.user.userId,

    );

  }


  // ==========================================
  // FAIR DISCOVERY FEED
  //
  // GET /videos/feed?page=1&limit=10
  //
  // IMPORTANT:
  // This MUST remain before @Get(':id').
  // ==========================================

  @Get('feed')
  getDiscoveryFeed(

    @Query('page')
    page: number = 1,

    @Query('limit')
    limit: number = 10,

  ) {

    return this.videosService
      .getDiscoveryFeed(

        Number(page),

        Number(limit),

      );

  }


  // ==========================================
  // GET ALL VIDEOS
  //
  // Existing chronological endpoint.
  // Newest first.
  // ==========================================

  @Get()
  findAll(

    @Query('page')
    page: number = 1,

    @Query('limit')
    limit: number = 10,

  ) {

    return this.videosService
      .findAll(

        Number(page),

        Number(limit),

      );

  }


  // ==========================================
  // SEARCH
  // ==========================================

  @Get('search')
  searchVideos(

    @Query('q')
    query: string,

  ) {

    return this.videosService
      .searchVideos(
        query,
      );

  }


  // ==========================================
  // MARKET
  // ==========================================

  @Get('market')
  async getMarket(

    @Query('type')
    type?: string,

  ) {

    return this.videosService
      .getMarket(
        type,
      );

  }


  // ==========================================
  // USER POSTS
  // ==========================================

  @Get('user/:creatorId')
  getVideosByCreator(

    @Param('creatorId')
    creatorId: string,

  ) {

    return this.videosService
      .getVideosByCreator(
        Number(creatorId),
      );

  }


  // ==========================================
  // MY CONTENT
  // ==========================================

  @UseGuards(
    AuthGuard('jwt'),
  )
  @Get('me')
  getMyVideos(
    @Req() req: any,
  ) {

    return this.videosService
      .getVideosByCreator(
        req.user.userId,
      );

  }


  // ==========================================
  // RELATED
  // ==========================================

  @Get(':id/related')
  getRelatedVideos(

    @Param('id')
    id: string,

  ) {

    return this.videosService
      .getRelatedVideos(
        Number(id),
      );

  }


  // ==========================================
  // SINGLE CONTENT
  // ==========================================

  @Get(':id')
  findOne(

    @Param('id')
    id: string,

  ) {

    return this.videosService
      .findOne(
        Number(id),
      );

  }


  // ==========================================
  // DELETE
  // ==========================================

  @UseGuards(
    AuthGuard('jwt'),
  )
  @Delete(':id')
  deleteVideo(

    @Param('id')
    id: string,

    @Req()
    req: any,

  ) {

    return this.videosService
      .deleteVideo(

        Number(id),

        req.user.userId,

      );

  }


  // ==========================================
  // UNDERSTAND
  // ==========================================

  @UseGuards(
    AuthGuard('jwt'),
  )
  @Post(':id/understand')
  pressUnderstand(

    @Param('id')
    id: string,

    @Req()
    req: any,

  ) {

    return this.videosService
      .pressUnderstand(

        Number(id),

        req.user.userId,

      );

  }


  // ==========================================
  // UPDATE
  // ==========================================

  @UseGuards(
    AuthGuard('jwt'),
  )
  @Patch(':id')
  updateVideo(

    @Param('id')
    id: string,

    @Body()
    body: any,

    @Req()
    req: any,

  ) {

    return this.videosService
      .updateVideo(

        Number(id),

        body,

        req.user.userId,

      );

  }

}