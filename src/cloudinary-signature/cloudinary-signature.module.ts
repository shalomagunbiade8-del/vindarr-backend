import {
  Module,
} from '@nestjs/common';

import {
  CloudinarySignatureController,
} from './cloudinary-signature.controller';

import {
  CloudinarySignatureService,
} from './cloudinary-signature.service';

@Module({
  controllers: [
    CloudinarySignatureController,
  ],

  providers: [
    CloudinarySignatureService,
  ],

  exports: [
    CloudinarySignatureService,
  ],
})
export class CloudinarySignatureModule {}