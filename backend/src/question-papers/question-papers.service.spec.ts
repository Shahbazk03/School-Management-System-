import { Test, TestingModule } from '@nestjs/testing';
import { QuestionPapersService } from './question-papers.service.js';

describe('QuestionPapersService', () => {
  let service: QuestionPapersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QuestionPapersService],
    }).compile();

    service = module.get<QuestionPapersService>(QuestionPapersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
