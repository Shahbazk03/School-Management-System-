import { Module } from '@nestjs/common';
import { AcademicSessionsService } from './academic-sessions.service.js';
import { AcademicSessionsController } from './academic-sessions.controller.js';

@Module({
  providers: [AcademicSessionsService],
  controllers: [AcademicSessionsController]
})
export class AcademicSessionsModule {}
