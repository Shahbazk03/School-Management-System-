import { Module } from '@nestjs/common';
import { SubjectsService } from './subjects.service.js';
import { SubjectsController } from './subjects.controller.js';

@Module({
  providers: [SubjectsService],
  controllers: [SubjectsController]
})
export class SubjectsModule {}
