import { Test, TestingModule } from '@nestjs/testing';
import { PurviewService } from './purview.service';

describe('PurviewService', () => {
  let service: PurviewService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PurviewService],
    }).compile();

    service = module.get<PurviewService>(PurviewService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
