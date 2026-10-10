import { Test, TestingModule } from '@nestjs/testing';
import { QuestionPapersController } from './question-papers.controller.js';

describe('QuestionPapersController', () => {
  let controller: QuestionPapersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuestionPapersController],
    }).compile();

    controller = module.get<QuestionPapersController>(QuestionPapersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
