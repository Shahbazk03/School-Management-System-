import { Module } from '@nestjs/common';
import { AchievementsService } from './achievements.service.js';
import { AchievementsController } from './achievements.controller.js';

@Module({
  providers: [AchievementsService],
  controllers: [AchievementsController]
})
export class AchievementsModule {}
