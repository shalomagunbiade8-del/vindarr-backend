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

import {
  diskStorage,
} from 'multer';

import {
  extname,
} from 'path';

import {
  MessagesService,
} from './messages.service';

import {
  SendMessageDto,
} from './dto/send-message.dto';


@Controller('messages')
export class MessagesController {

  constructor(
    private readonly messagesService:
      MessagesService,
  ) {}


  // ==========================================
  // SEND TEXT / ATTACHMENT MESSAGE
  // ==========================================

  @Post()
  @UseGuards(
    AuthGuard('jwt'),
  )
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
  @UseGuards(
    AuthGuard('jwt'),
  )
  async getChat(
    @Param('username')
    username: string,

    @Req()
    req: any,
  ) {

    return this.messagesService.getConversation(
      req.user.username,
      username,
    );
  }


  // ==========================================
  // GET CONVERSATION
  // ==========================================

  @Get(
    'conversation/:user1/:user2',
  )
  async getConversation(
    @Param('user1')
    user1: string,

    @Param('user2')
    user2: string,
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
  @UseGuards(
    AuthGuard('jwt'),
  )
  async deleteMessage(
    @Param('id')
    id: string,

    @Req()
    req: any,
  ) {

    return this.messagesService.deleteMessage(
      Number(id),
      req.user,
    );
  }


  // ==========================================
  // UPLOAD ATTACHMENT
  //
  // Supports:
  // image
  // PDF
  // video
  // ==========================================

  @Post('upload')
  @UseGuards(
    AuthGuard('jwt'),
  )
  @UseInterceptors(
    FileInterceptor(
      'file',
      {
        storage:
          diskStorage({

            destination:
              './uploads',

            filename:
              (
                req,
                file,
                callback,
              ) => {

                const uniqueName =
                  `${Date.now()}-${Math.round(
                    Math.random() * 1e9,
                  )}${extname(
                    file.originalname,
                  )}`;

                callback(
                  null,
                  uniqueName,
                );
              },

          }),

        limits: {

          /*
           * Increase this if you want
           * longer video notes.
           */

          fileSize:
            25 * 1024 * 1024,

        },

        fileFilter:
          (
            req,
            file,
            callback,
          ) => {

            const allowed =
              file.mimetype.startsWith(
                'image/',
              )
              ||
              file.mimetype.startsWith(
                'video/',
              )
              ||
              file.mimetype ===
                'application/pdf';


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

      },
    ),
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


    return {

      url:
        `/uploads/${file.filename}`,

      type:
        file.mimetype,

      originalName:
        file.originalname,

      size:
        file.size,

    };
  }


  // ==========================================
  // INBOX
  // ==========================================

  @Get('inbox')
  @UseGuards(
    AuthGuard('jwt'),
  )
  async getInbox(
    @Req()
    req: any,
  ) {

    return this.messagesService.getInbox(
      req.user.username,
    );
  }
}