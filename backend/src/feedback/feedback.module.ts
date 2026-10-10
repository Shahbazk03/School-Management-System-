import { Module } from '@nestjs/common';
import { FeedbackService } from './feedback.service.js';
import { FeedbackController } from './feedback.controller.js';

@Module({
  providers: [FeedbackService],
  controllers: [FeedbackController]
})
export class FeedbackModule {}
