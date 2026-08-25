import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';

import {
  AuthGuard,
} from '@nestjs/passport';

import {
  CloudinarySignatureService,
} from './cloudinary-signature.service';


@Controller('cloudinary')
export class CloudinarySignatureController {

  constructor(
    private readonly cloudinarySignatureService:
      CloudinarySignatureService,
  ) {}


  // ==========================================
  // SIGNED UPLOAD
  //
  // POST /cloudinary/signature
  // ==========================================

  @UseGuards(
    AuthGuard('jwt'),
  )
  @Post('signature')
  generateSignature(
    @Body() body: any,
    @Req() req: any,
  ) {

    const type =
      String(
        body?.type || '',
      ).trim();


    const purpose =
      body?.purpose
        ? String(
            body.purpose
          ).trim()
        : undefined;


    if (!type) {

      throw new BadRequestException(
        'Upload type is required',
      );

    }


    return this.cloudinarySignatureService
      .generateUploadSignature(

        type,

        req.user.userId,

        purpose,

      );

  }

}