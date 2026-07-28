import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Delete,
  Param,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
  Query,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';

import { StoriesService } from './stories.service';

import { CreateStoryDto } from './dto/create-story.dto';

import { FileInterceptor } from '@nestjs/platform-express';

import { memoryStorage } from 'multer';

import { v2 as cloudinary } from 'cloudinary';

import * as streamifier from 'streamifier';

@Controller('stories')
export class StoriesController {

  constructor(
    private readonly storiesService: StoriesService
  ) {}

  // =====================================
  // CREATE STORY
  // =====================================

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(
    FileInterceptor('image', {
      storage: memoryStorage(),
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
    }),
  )
  async create(
    @UploadedFile() file: any,
    @Body() dto: CreateStoryDto,
    @Req() req,
  ) {

    let imageUrl: string | undefined = undefined;

    if (file) {

      const uploadResult = await new Promise<any>(
        (resolve, reject) => {

          const stream =
            cloudinary.uploader.upload_stream(
              {
                resource_type: 'image',
                folder: 'vindarr_stories',
              },

              (error, result) => {

                if (error) {
                  return reject(error);
                }

                resolve(result);

              },
            );

          streamifier
            .createReadStream(file.buffer)
            .pipe(stream);

        },
      );

      imageUrl = uploadResult.secure_url;

    }

    return this.storiesService.create(
      {
        ...dto,
        imageUrl,
      },
      req.user.userId,
    );

  }

  // =====================================
  // GET STORIES
  // =====================================

  @Get()
async findAll(
  @Req() req,
  @Query('page') page = 1,
) {

  const currentUserId =
    req.user?.userId;

  return this.storiesService.findAll(
    currentUserId,
    Number(page),
  );

}

  // =====================================
  // DELETE STORY
  // =====================================

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async deleteStory(
    @Param('id') id: number,
    @Req() req,
  ) {

    await this.storiesService.deleteStory(
      Number(id),
      req.user.userId,
    );

    return {
      message: 'Story deleted successfully',
    };

  }

  // =====================================
  // LIKE STORY
  // =====================================

  @UseGuards(AuthGuard('jwt'))
  @Post(':id/like')
  toggleLike(
    @Param('id') id: number,
    @Req() req,
  ) {

    return this.storiesService.toggleLike(
      Number(id),
      req.user.userId,
    );

  }

  // =====================================
  // SEARCH STORIES
  // =====================================

  @Get('search')
async search(
  @Query('q') q: string,
) {

  return this.storiesService.search(q);

}

  // =====================================
// ADD COMMENT
// =====================================

@UseGuards(AuthGuard('jwt'))
@Post(':id/comments')
addComment(
  @Param('id') id: number,
  @Body() body: { content: string },
  @Req() req,
) {

  return this.storiesService.addComment(
    Number(id),
    body.content,
    req.user.userId,
  );

}

// =====================================
// GET COMMENTS
// =====================================

@Get(':id/comments')
getComments(
  @Param('id') id: number,
) {

  return this.storiesService.getComments(
    Number(id),
  );

}

  // =====================================
  // GET ONE STORY
  // =====================================

  @Get(':id')
  getOne(
    @Param('id') id: number,
  ) {

    return this.storiesService.findOne(
      Number(id),
    );

  }

  // =====================================
  // UPDATE STORY
  // =====================================

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() dto: CreateStoryDto,
    @Req() req,
  ) {

    return this.storiesService.update(
      Number(id),
      dto,
      req.user.userId,
    );

  }

}