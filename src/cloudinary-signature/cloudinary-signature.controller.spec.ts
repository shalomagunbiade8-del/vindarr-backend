import { Test, TestingModule } from '@nestjs/testing';
import { CloudinarySignatureController } from './cloudinary-signature.controller';

describe('CloudinarySignatureController', () => {
  let controller: CloudinarySignatureController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CloudinarySignatureController],
    }).compile();

    controller = module.get<CloudinarySignatureController>(CloudinarySignatureController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
