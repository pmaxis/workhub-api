import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { Action } from '@/common/ability/ability.types';
import { CheckPolicies } from '@/common/decorators/policy.decorator';
import { SessionsService } from '@/modules/sessions/service/sessions.service';
import { CreateSessionDto } from '@/modules/sessions/dto/create-session.dto';

@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post()
  @CheckPolicies((ability) => ability.can(Action.Create, 'Session'))
  create(@Body() createSessionDto: CreateSessionDto) {
    return this.sessionsService.create(createSessionDto);
  }

  @Get()
  @CheckPolicies((ability) => ability.can(Action.Read, 'Session'))
  findAll() {
    return this.sessionsService.findAll();
  }

  @Get(':id')
  @CheckPolicies((ability) => ability.can(Action.Read, 'Session'))
  findOne(@Param('id') id: string) {
    return this.sessionsService.findOne(id);
  }

  @Delete(':id')
  @CheckPolicies((ability) => ability.can(Action.Delete, 'Session'))
  delete(@Param('id') id: string) {
    return this.sessionsService.delete(id);
  }
}
