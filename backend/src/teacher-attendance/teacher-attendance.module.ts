import { Module } from '@nestjs/common';
import { TeacherAttendanceService } from './teacher-attendance.service.js';
import { TeacherAttendanceController } from './teacher-attendance.controller.js';

@Module({
  providers: [TeacherAttendanceService],
  controllers: [TeacherAttendanceController]
})
export class TeacherAttendanceModule {}
