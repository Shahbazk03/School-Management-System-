import { Module } from '@nestjs/common';
import { TeacherAssignmentService } from './teacher-assignment.service.js';
import { TeacherAssignmentController } from './teacher-assignment.controller.js';

@Module({
  providers: [TeacherAssignmentService],
  controllers: [TeacherAssignmentController],
  exports: [TeacherAssignmentService],
})
export class TeacherAssignmentModule {}
