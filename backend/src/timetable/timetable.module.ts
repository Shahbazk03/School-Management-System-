import { Module } from '@nestjs/common';
import { TimetableService } from './timetable.service.js';
import { TimetableController } from './timetable.controller.js';

@Module({
  providers: [TimetableService],
  controllers: [TimetableController]
})
export class TimetableModule {}
