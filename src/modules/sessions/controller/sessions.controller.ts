import { Controller, Get, Param, Delete } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { Action } from '@/common/ability/ability.types';
import { CheckPolicies } from '@/common/decorators/policy.decorator';
import { CurrentUserId } from '@/common/decorators/current-user.decorator';
import { SessionsService } from '@/modules/sessions/service/sessions.service';
import { SessionResponseDto } from '@/modules/sessions/dto/session-response.dto';

@ApiTags('Sessions')
@ApiBearerAuth('access-token')
@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Get()
  @ApiOperation({ summary: 'List sessions for the current user' })
  @ApiOkResponse({ type: [SessionResponseDto] })
  @CheckPolicies((ability) => ability.can(Action.Read, 'Session'))
  async findAll(@CurrentUserId() userId: string) {
    return this.sessionsService.findAllForUser(userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Revoke a session belonging to the current user' })
  @ApiParam({ name: 'id', description: 'Session ID' })
  @ApiOkResponse({ description: 'Session removed' })
  @CheckPolicies((ability) => ability.can(Action.Delete, 'Session'))
  async delete(@Param('id') id: string, @CurrentUserId() userId: string) {
    await this.sessionsService.deleteForUser(id, userId);
  }
}
