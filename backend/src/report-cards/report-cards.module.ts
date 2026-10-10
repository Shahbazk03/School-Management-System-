import { Module } from '@nestjs/common';
import { ReportCardsService } from './report-cards.service.js';
import { ReportCardsController } from './report-cards.controller.js';

@Module({
  providers: [ReportCardsService],
  controllers: [ReportCardsController]
})
export class ReportCardsModule {}
