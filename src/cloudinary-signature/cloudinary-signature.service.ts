import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';

import {
  v2 as cloudinary,
} from 'cloudinary';


@Injectable()
export class CloudinarySignatureService {

  generateUploadSignature(
    type: string,
    userId: number,
    purpose?: string,
  ) {

    if (!userId) {

      throw new BadRequestException(
        'Authenticated user required',
      );

    }


    let resourceType =
      'auto';

    let folder =
      'vindarr_uploads';


    // ==========================================
    // VIDEO
    // ==========================================

    if (
      type === 'video'
    ) {

      resourceType =
        'video';

      folder =
        'vindarr_videos';

    }


    // ==========================================
    // EBOOK
    // ==========================================

    else if (
      type === 'ebook'
    ) {

      if (
        purpose === 'cover'
      ) {

        resourceType =
          'image';

        folder =
          'vindarr_covers';

      }
      else {

        resourceType =
          'raw';

        folder =
          'vindarr_ebooks';

      }

    }


    // ==========================================
    // FASHION
    // ==========================================

    else if (
      type === 'fashion'
    ) {

      resourceType =
        'auto';

      folder =
        'vindarr_fashion';

    }


    // ==========================================
    // ESSENTIAL
    // ==========================================

    else if (
      type === 'essential'
    ) {

      resourceType =
        'auto';

      folder =
        'vindarr_essentials';

    }


    else {

      throw new BadRequestException(
        `Unsupported upload type: ${type}`,
      );

    }


    const timestamp =
      Math.floor(
        Date.now() / 1000,
      );


    const paramsToSign = {

      timestamp,

      folder,

    };


    try {

      const signature =
        cloudinary.utils.api_sign_request(
          paramsToSign,

          process.env
            .CLOUDINARY_API_SECRET!,
        );


      return {

        signature,

        timestamp,

        folder,

        resourceType,

        cloudName:
          process.env
            .CLOUDINARY_CLOUD_NAME,

        apiKey:
          process.env
            .CLOUDINARY_API_KEY,

      };

    }
    catch (error) {

      console.error(
        'CLOUDINARY SIGNATURE ERROR:',
        error,
      );


      throw new InternalServerErrorException(
        'Unable to generate Cloudinary upload signature',
      );

    }

  }

}