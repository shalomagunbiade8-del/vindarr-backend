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
  UploadedFile,
  BadRequestException
} from '@nestjs/common'; 

import { AuthGuard } from '@nestjs/passport';

import { VideosService } from './videos.service';
import { CreateVideoDto } from './dto/create-video.dto';

import { FileInterceptor } from '@nestjs/platform-express';
 
import { v2 as cloudinary } from 'cloudinary';
import * as streamifier from 'streamifier'; 

@Controller('videos')
export class VideosController {

  constructor(private readonly videosService: VideosService) {}

  @Post()
@UseGuards(AuthGuard('jwt'))
@UseInterceptors(
  FileInterceptor('video', {
    limits: { fileSize: 50 * 1024 * 1024 },
  }),
)
async uploadVideo(
  @UploadedFile() file: any,
  @Body() body: CreateVideoDto,
  @Req() req
) {
  if (!file) {
    throw new Error('Video file is required');
  }

  // Upload to Cloudinary manually
  const uploadResult = await new Promise<any>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'video',
        folder: 'vindarr_videos',
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      },
    );

    streamifier.createReadStream(file.buffer).pipe(stream);
  });

  const videoUrl = uploadResult.secure_url;

  return this.videosService.create(
    {
      ...body,
      videoUrl,
    },
    req.user.userId,
  );
}

  @Get()
findAll(
  @Query('page') page: number = 1,
  @Query('limit') limit: number = 10
) {
  return this.videosService.findAll(page, limit);
}

@Get('search')
searchVideos(@Query('q') query: string) {
  return this.videosService.searchVideos(query);
} 

@Get('/user/:creatorId')
getVideosByCreator(
  @Param('creatorId') creatorId: number
){
  return this.videosService.getVideosByCreator(Number(creatorId));
} 


  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  deleteVideo(@Param('id') id: number, @Req() req) {
    return this.videosService.deleteVideo(Number(id), req.user.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':id/understand')
  pressUnderstand(
    @Param('id') id: number,
    @Req() req,
  ) {
    return this.videosService.pressUnderstand(
      Number(id),
      req.user.userId,
    );
  }

}