import { Module } from '@nestjs/common';
import { QuestionPapersService } from './question-papers.service.js';
import { QuestionPapersController } from './question-papers.controller.js';

@Module({
  providers: [QuestionPapersService],
  controllers: [QuestionPapersController]
})
export class QuestionPapersModule {}
