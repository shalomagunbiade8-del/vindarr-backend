import { Test, TestingModule } from '@nestjs/testing';
import { CloudinarySignatureService } from './cloudinary-signature.service';

describe('CloudinarySignatureService', () => {
  let service: CloudinarySignatureService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CloudinarySignatureService],
    }).compile();

    service = module.get<CloudinarySignatureService>(CloudinarySignatureService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
