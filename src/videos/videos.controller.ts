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
  UploadedFile
} from '@nestjs/common'; 

import { AuthGuard } from '@nestjs/passport';

import { VideosService } from './videos.service';
import { CreateVideoDto } from './dto/create-video.dto';

import { FileInterceptor } from '@nestjs/platform-express';

import { diskStorage } from 'multer';
import { extname } from 'path'; 

@Controller('videos')
export class VideosController {

  constructor(private readonly videosService: VideosService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  @UseInterceptors(
  FileInterceptor('video', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = extname(file.originalname);
        cb(null, `${uniqueName}${ext}`);
      },
    }),
  }),
) 

  uploadVideo(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: CreateVideoDto,
    @Req() req
  ){

    if (!file) {
      throw new Error('Video file is required');
    }

    const videoUrl = `/uploads/${file.filename}`;


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