import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@Controller('upload')
export class UploadController {

  @Post('avatar')
  @UseInterceptors(FileInterceptor('file', {

    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {

        const uniqueName =
          Date.now() + '-' + file.originalname;

        cb(null, uniqueName);
      }
    }),

    fileFilter: (req, file, cb) => {

      if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
        return cb(new Error('Only image files allowed'), false);
      }

      cb(null, true);

    }

  }))

  uploadAvatar(@UploadedFile() file) {

    return {
      avatar: `/uploads/${file.filename}`
    };

  }

} 
