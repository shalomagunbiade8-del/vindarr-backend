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

import cloudinary from '../config/cloudinary';  

@Controller('videos')
export class VideosController {

  constructor(private readonly videosService: VideosService) {}

  @UseGuards(AuthGuard('jwt'))
@Post()
@UseInterceptors(FileInterceptor('video'))
async uploadVideo(
  @UploadedFile() file: Express.Multer.File,
  @Body() body: CreateVideoDto,
  @Req() req
){

  if (!file) {
    throw new BadRequestException('Video file is required');
  }

  const result = await cloudinary.uploader.upload(file.path, {
    resource_type: 'video',
    folder: 'vindarr_videos',
  });

  const videoUrl = result.secure_url;

  return this.videosService.create(
    {
      ...body,
      videoUrl
    },
    req.user.userId
  );
} 


  @Get()
findAll(
  @Query('page') page: number = 1,
  @Query('limit') limit: number = 10
) {
  return this.videosService.findAll(page, limit);
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