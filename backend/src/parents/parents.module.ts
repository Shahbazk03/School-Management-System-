import { Module } from '@nestjs/common';
import { ParentsService } from './parents.service.js';
import { ParentsController } from './parents.controller.js';

@Module({
  providers: [ParentsService],
  controllers: [ParentsController]
})
export class ParentsModule {}
