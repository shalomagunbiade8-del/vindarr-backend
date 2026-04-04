import { Controller, Post, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { v2 as cloudinary } from 'cloudinary';
import * as streamifier from 'streamifier';
import { Request } from 'express';

@Controller('upload')
export class UploadController {

  @Post('avatar')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(@UploadedFile() file: any) {

    if (!file) {
      throw new Error('No file uploaded');
    }

    const uploadResult = await new Promise<any>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          folder: 'vindarr_avatars',
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );

      streamifier.createReadStream(file.buffer).pipe(stream);
    });

    return {
      avatar: uploadResult.secure_url,
    };
  }
} 
