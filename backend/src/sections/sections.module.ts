import { Module } from '@nestjs/common';
import { SectionsService } from './sections.service.js';
import { SectionsController } from './sections.controller.js';

@Module({
  providers: [SectionsService],
  controllers: [SectionsController]
})
export class SectionsModule {}
