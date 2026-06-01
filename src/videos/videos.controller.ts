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
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';

import { VideosService } from './videos.service';

import { FileFieldsInterceptor } from '@nestjs/platform-express';

import { v2 as cloudinary } from 'cloudinary';
import * as streamifier from 'streamifier';

import { diskStorage } from 'multer';

import * as fs from 'fs';

import { promisify } from 'util';

import * as path from 'path';

if (!fs.existsSync('./uploads')) {
  fs.mkdirSync('./uploads', { recursive: true });
}

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
      storage: diskStorage({
  destination: path.join(process.cwd(), 'uploads'),
}),

      limits: {
        fileSize: 1024 * 1024 * 50,
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

    console.log('BODY:', body);

console.log('FILE:', {
  originalname: file?.originalname,
  mimetype: file?.mimetype,
  size: file?.size,
  path: file?.path,
});

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

    console.log('PRICE RECEIVED:', body.price);

    return this.videosService.create(
      {
        ...body,
        type,

        videoUrl,
        fileUrl,
        coverUrl,

        price:
  body.price &&
  !isNaN(Number(String(body.price).replace(/,/g, '')))
    ? Number(String(body.price).replace(/,/g, ''))
    : 0,
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

  console.log('FILE PATH:', file.path);
console.log('RESOURCE TYPE:', resource_type);
console.log('FOLDER:', folder);

const uploadResult =
  await cloudinary.uploader.upload(
    file.path,
    {
      resource_type,
      folder,
    },
  );

console.log('CLOUDINARY RESULT:', uploadResult.secure_url);

  // DELETE TEMP FILE
  fs.unlinkSync(file.path);

  return uploadResult.secure_url;
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

  // Get videos for creator dashboard
@UseGuards(AuthGuard('jwt'))
@Get('me')
getMyVideos(@Req() req) {
  return this.videosService.getVideosByCreator(
    req.user.userId,
  );
}

  // Ebook reader
  @UseGuards(AuthGuard('jwt'))
@Get(':id/read')
readBook(
  @Param('id') id: string,
  @Req() req,
) {
  return this.videosService.readBook(
    Number(id),
    req.user.userId,
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

  
@UseGuards(AuthGuard('jwt'))
@Patch(':id')
updateVideo(
  @Param('id') id: string,
  @Body() body: any,
  @Req() req,
) {
  return this.videosService.updateVideo(
    Number(id),
    body,
    req.user.userId,
  );
}

}