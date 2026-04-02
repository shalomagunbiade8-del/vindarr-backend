import { Controller, Get, Post, Body, Delete, Param, UseGuards, Req, UseInterceptors, UploadedFile, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { StoriesService } from './stories.service';
import { CreateStoryDto } from './dto/create-story.dto';
import { FileInterceptor } from '@nestjs/platform-express';  
import { v2 as cloudinary } from 'cloudinary';
import * as streamifier from 'streamifier';

@Controller('stories')
export class StoriesController {
  constructor(private readonly storiesService: StoriesService) {}

  @Post()
@UseGuards(AuthGuard('jwt'))
@UseInterceptors(FileInterceptor('image'))
async create(
  @UploadedFile() file: Express.Multer.File,
  @Body() dto: CreateStoryDto,
  @Req() req
) {

  let imageUrl: string | undefined = undefined;

  if (file) {
    const uploadResult = await new Promise<any>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          folder: 'vindarr_stories',
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );

      streamifier.createReadStream(file.buffer).pipe(stream);
    });

    imageUrl = uploadResult.secure_url;
  }

  return this.storiesService.create(
    {
      ...dto,
      imageUrl,
    },
    req.user.userId
  );
} 


  @Get()
@UseGuards(AuthGuard('jwt'))
findAll(
  @Req() req,
  @Query('page') page = 1
) {
  return this.storiesService.findAll(req.user.userId, Number(page));
}


  @UseGuards(AuthGuard('jwt'))
@Delete(':id')
async deleteStory(@Param('id') id: number, @Req() req) {
  await this.storiesService.deleteStory(Number(id), req.user.userId);
  return { message: 'Story deleted successfully' };
}

@UseGuards(AuthGuard('jwt'))
@Post(':id/like')
toggleLike(@Param('id') id: number, @Req() req) {
  return this.storiesService.toggleLike(Number(id), req.user.userId);
} 

}
