import { Module } from '@nestjs/common';
import { MarksService } from './marks.service.js';
import { MarksController } from './marks.controller.js';

@Module({
  providers: [MarksService],
  controllers: [MarksController]
})
export class MarksModule {}
