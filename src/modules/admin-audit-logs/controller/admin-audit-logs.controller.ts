import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Action } from '@/common/ability/ability.types';
import { CheckPolicies } from '@/common/decorators/policy.decorator';
import { AdminAuditLogsService } from '@/modules/admin-audit-logs/service/admin-audit-logs.service';
import { QueryAdminAuditLogsDto } from '@/modules/admin-audit-logs/dto/query-admin-audit-logs.dto';
import { PaginatedAdminAuditLogsResponseDto } from '@/modules/admin-audit-logs/dto/paginated-admin-audit-logs-response.dto';

@ApiTags('Admin audit logs')
@ApiBearerAuth('access-token')
@Controller('admin/audit-logs')
export class AdminAuditLogsController {
  constructor(private readonly adminAuditLogsService: AdminAuditLogsService) {}

  @Get()
  @ApiOperation({
    summary: 'List application audit logs (admin)',
    description: 'Requires the manage.all permission. Intended for the admin panel only.',
  })
  @ApiOkResponse({ type: PaginatedAdminAuditLogsResponseDto })
  @CheckPolicies((ability) => ability.can(Action.Manage, 'all'))
  findAll(@Query() query: QueryAdminAuditLogsDto): Promise<PaginatedAdminAuditLogsResponseDto> {
    return this.adminAuditLogsService.findPage(query);
  }
}
