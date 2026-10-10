import { Test, TestingModule } from '@nestjs/testing';
import { MarksService } from './marks.service.js';

describe('MarksService', () => {
  let service: MarksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MarksService],
    }).compile();

    service = module.get<MarksService>(MarksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
