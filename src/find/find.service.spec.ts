import { Test, TestingModule } from '@nestjs/testing';
import { FindService } from './find.service';

describe('FindService', () => {
  let service: FindService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FindService],
    }).compile();

    service = module.get<FindService>(FindService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
