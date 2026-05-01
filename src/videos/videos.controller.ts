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
@UseInterceptors(FileInterceptor('file'))
async uploadContent(
  @UploadedFile() file: any,
  @Body() body: any,
  @Req() req
) {
  const { type } = body;

  if (!type) {
    throw new BadRequestException('Type is required');
  }

  let fileUrl: string | null = null;
let coverUrl: string | null = null;
let videoUrl: string | null = null; 

  // 🔥 HANDLE VIDEO
  if (type === "video") {
    if (!file) throw new BadRequestException("Video file required");

    const upload = await this.uploadToCloudinary(file, "video", "vindarr_videos");
    videoUrl = upload;
  }

  // 🔥 HANDLE EBOOK
  if (type === "ebook") {
    if (!file) throw new BadRequestException("PDF required");

    const upload = await this.uploadToCloudinary(file, "raw", "vindarr_ebooks");
    fileUrl = upload;

    // cover comes separately from frontend later
    coverUrl = body.coverUrl;
  }

  // 🔥 HANDLE FASHION
  if (type === "fashion") {
    if (!file) throw new BadRequestException("Image/video required");

    const upload = await this.uploadToCloudinary(file, "auto", "vindarr_fashion");
    fileUrl = upload;
  }

  return this.videosService.create(
    {
      ...body,
      videoUrl,
      fileUrl,
      coverUrl,
      type,
      price: body.price ? Number(body.price) : null,
    },
    req.user.userId,
  );
} 

private async uploadToCloudinary(file, resource_type, folder) {
  return new Promise<string>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type, folder },
      (error, result) => {
        if (error) return reject(error);
        if (!result) return reject("Upload failed");
resolve(result.secure_url); 
      },
    );

    streamifier.createReadStream(file.buffer).pipe(stream);
  });
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

@Get('/market')
async getMarket(@Query('type') type: string) {
  return this.videosService.getMarket(type);
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