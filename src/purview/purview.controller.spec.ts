import { Test, TestingModule } from '@nestjs/testing';
import { PurviewController } from './purview.controller';

describe('PurviewController', () => {
  let controller: PurviewController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PurviewController],
    }).compile();

    controller = module.get<PurviewController>(PurviewController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
