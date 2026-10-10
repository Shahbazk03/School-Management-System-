import { Module } from '@nestjs/common';
import { AuditLogsService } from './audit-logs.service.js';
import { AuditLogsController } from './audit-logs.controller.js';

@Module({
  providers: [AuditLogsService],
  controllers: [AuditLogsController]
})
export class AuditLogsModule {}
