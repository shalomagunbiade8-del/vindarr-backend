import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  Req,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';

import {
  FileInterceptor,
} from '@nestjs/platform-express';

import {
  AuthGuard,
} from '@nestjs/passport';

import cloudinary from '../config/cloudinary';

import * as streamifier from 'streamifier';

import {
  MessagesService,
} from './messages.service';

import {
  SendMessageDto,
} from './dto/send-message.dto';


@Controller('messages')
export class MessagesController {

  constructor(
    private readonly messagesService: MessagesService,
  ) {}


  // ==========================================
  // SEND MESSAGE
  // ==========================================

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async sendMessage(
    @Req() req: any,
    @Body() body: SendMessageDto,
  ) {

    return this.messagesService.sendMessage(
      body,
      req.user,
    );

  }


  // ==========================================
  // GET CHAT
  // ==========================================

  @Get('chat/:username')
  @UseGuards(AuthGuard('jwt'))
  async getChat(
    @Param('username') username: string,
    @Req() req: any,
  ) {

    return this.messagesService.getConversation(
      req.user.username,
      username,
    );

  }


  // ==========================================
  // GET CONVERSATION
  // ==========================================

  @Get('conversation/:user1/:user2')
  async getConversation(
    @Param('user1') user1: string,
    @Param('user2') user2: string,
  ) {

    return this.messagesService.getConversation(
      user1,
      user2,
    );

  }


  // ==========================================
  // DELETE MESSAGE
  // ==========================================

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async deleteMessage(
    @Param('id') id: string,
    @Req() req: any,
  ) {

    return this.messagesService.deleteMessage(
      Number(id),
      req.user,
    );

  }


  // ==========================================
  // UPLOAD MESSAGE ATTACHMENT
  //
  // IMAGE
  // VIDEO
  // PDF
  //
  // MAX SIZE: 25 MB
  //
  // IMPORTANT:
  // Files are uploaded directly to Cloudinary.
  // Nothing is stored on Render's local filesystem.
  // ==========================================

  @Post('upload')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(
    FileInterceptor('file', {

      limits: {
        fileSize:
          25 * 1024 * 1024,
      },

      fileFilter: (
        req,
        file,
        callback,
      ) => {

        const isImage =
          file.mimetype.startsWith(
            'image/',
          );

        const isVideo =
          file.mimetype.startsWith(
            'video/',
          );

        const isPdf =
          file.mimetype ===
          'application/pdf';


        const allowed =
          isImage ||
          isVideo ||
          isPdf;


        if (!allowed) {

          return callback(
            new BadRequestException(
              'Only images, videos and PDFs are allowed.',
            ),
            false,
          );

        }


        callback(
          null,
          true,
        );

      },

    }),
  )
  async uploadFile(
    @UploadedFile()
    file: any,
  ) {

    if (!file) {

      throw new BadRequestException(
        'File upload failed.',
      );

    }


    // ========================================
    // UPLOAD BUFFER TO CLOUDINARY
    // ========================================

    const uploadResult =
      await new Promise<any>(
        (resolve, reject) => {

          const uploadStream =
            cloudinary.uploader.upload_stream(
              {
                resource_type: 'auto',

                folder:
                  'vindarr_message_attachments',

              },

              (
                error,
                result,
              ) => {

                if (error) {

                  return reject(
                    error,
                  );

                }


                resolve(
                  result,
                );

              },

            );


          streamifier
            .createReadStream(
              file.buffer,
            )
            .pipe(
              uploadStream,
            );

        },
      );


    // ========================================
    // CLOUDINARY MUST RETURN A SECURE URL
    // ========================================

    if (
      !uploadResult?.secure_url
    ) {

      throw new BadRequestException(
        'Cloudinary did not return a secure URL.',
      );

    }


    // ========================================
    // RETURN PERMANENT URL TO FRONTEND
    // ========================================

    return {

      url:
        uploadResult.secure_url,

      type:
        file.mimetype,

      originalName:
        file.originalname,

      size:
        file.size,

      publicId:
        uploadResult.public_id,

      resourceType:
        uploadResult.resource_type,

    };

  }


  // ==========================================
  // INBOX
  // ==========================================

  @Get('inbox')
  @UseGuards(AuthGuard('jwt'))
  async getInbox(
    @Req() req: any,
  ) {

    return this.messagesService.getInbox(
      req.user.username,
    );

  }

}