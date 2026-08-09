import { Test, TestingModule } from '@nestjs/testing';
import { FindController } from './find.controller';

describe('FindController', () => {
  let controller: FindController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FindController],
    }).compile();

    controller = module.get<FindController>(FindController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
