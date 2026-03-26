import { Controller, Get, Post, Body, Delete, Param, UseGuards, Req, UseInterceptors, UploadedFile, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { StoriesService } from './stories.service';
import { CreateStoryDto } from './dto/create-story.dto';
import { FileInterceptor } from '@nestjs/platform-express'; 
import { diskStorage } from 'multer';
import { extname } from 'path'; 

@Controller('stories')
export class StoriesController {
  constructor(private readonly storiesService: StoriesService) {}

  @Post()
@UseGuards(AuthGuard('jwt'))
@UseInterceptors(FileInterceptor('image', {
  storage: diskStorage({
    destination: './uploads',
    filename: (req, file, callback) => {
      const uniqueName =
        Date.now() + '-' + Math.round(Math.random() * 1e9);
      callback(null, uniqueName + extname(file.originalname));
    }
  })
})) 

create(
  @UploadedFile() file: Express.Multer.File,
  @Body() dto: CreateStoryDto,
  @Req() req
) {

  const imageUrl = file ? `/uploads/${file.filename}` : null; 

  return this.storiesService.create(
    {
      ...dto,
      // title: dto.title,
      content: dto.content,
      imageUrl: imageUrl || undefined,
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
