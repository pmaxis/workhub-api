import { Controller, Get, Param, Delete } from '@nestjs/common';
import { Action } from '@/common/ability/ability.types';
import { CheckPolicies } from '@/common/decorators/policy.decorator';
import { CurrentUserId } from '@/common/decorators/current-user.decorator';
import { SessionsService } from '@/modules/sessions/service/sessions.service';

@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Get()
  @CheckPolicies((ability) => ability.can(Action.Read, 'Session'))
  async findAll(@CurrentUserId() userId: string) {
    return this.sessionsService.findAllForUser(userId);
  }

  @Delete(':id')
  @CheckPolicies((ability) => ability.can(Action.Delete, 'Session'))
  async delete(@Param('id') id: string, @CurrentUserId() userId: string) {
    await this.sessionsService.deleteForUser(id, userId);
  }
}
