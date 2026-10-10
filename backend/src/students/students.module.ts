import { Module } from '@nestjs/common';
import { StudentsService } from './students.service.js';
import { StudentsController } from './students.controller.js';

@Module({
  providers: [StudentsService],
  controllers: [StudentsController]
})
export class StudentsModule {}
