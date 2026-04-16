import { Module } from '@nestjs/common';
import { DatabaseModule } from '@/infrastructure/database/database.module';
import { AdminAuditLogsController } from '@/modules/admin-audit-logs/controller/admin-audit-logs.controller';
import { AdminAuditLogsRepository } from '@/modules/admin-audit-logs/repository/admin-audit-logs.repository';
import { AdminAuditLogsService } from '@/modules/admin-audit-logs/service/admin-audit-logs.service';
import { AdminAuditLogWriterService } from '@/modules/admin-audit-logs/service/admin-audit-log-writer.service';

@Module({
  imports: [DatabaseModule],
  controllers: [AdminAuditLogsController],
  providers: [AdminAuditLogsRepository, AdminAuditLogsService, AdminAuditLogWriterService],
  exports: [AdminAuditLogWriterService],
})
export class AdminAuditLogsModule {}
