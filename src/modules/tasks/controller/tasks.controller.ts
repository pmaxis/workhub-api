import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query } from '@nestjs/common';
import { Action } from '@/common/ability/ability.types';
import type { AppAbility } from '@/common/ability/ability.types';
import { CheckPolicies } from '@/common/decorators/policy.decorator';
import { CurrentUserId } from '@/common/decorators/current-user.decorator';
import { CurrentAbility } from '@/common/decorators/current-ability.decorator';
import { TasksService } from '@/modules/tasks/service/tasks.service';
import { CreateTaskDto } from '@/modules/tasks/dto/create-task.dto';
import { UpdateTaskDto } from '@/modules/tasks/dto/update-task.dto';
import { TaskResponseDto } from '@/modules/tasks/dto/task-response.dto';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @CheckPolicies((ability) => ability.can(Action.Create, 'Task'))
  create(
    @Body() dto: CreateTaskDto,
    @CurrentUserId() userId: string,
    @CurrentAbility() ability: AppAbility,
  ): Promise<TaskResponseDto> {
    return this.tasksService.create(userId, ability, dto);
  }

  @Get()
  @CheckPolicies((ability) => ability.can(Action.Read, 'Task'))
  findAll(
    @Query('projectId') projectId: string | undefined,
    @CurrentAbility() ability: AppAbility,
  ): Promise<TaskResponseDto[]> {
    return this.tasksService.findAll(ability, projectId);
  }

  @Get(':id')
  @CheckPolicies((ability) => ability.can(Action.Read, 'Task'))
  findOne(
    @Param('id') id: string,
    @CurrentAbility() ability: AppAbility,
  ): Promise<TaskResponseDto> {
    return this.tasksService.findOne(id, ability);
  }

  @Patch(':id')
  @CheckPolicies((ability) => ability.can(Action.Update, 'Task'))
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
    @CurrentAbility() ability: AppAbility,
  ): Promise<TaskResponseDto> {
    return this.tasksService.update(id, ability, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @CheckPolicies((ability) => ability.can(Action.Delete, 'Task'))
  delete(@Param('id') id: string, @CurrentAbility() ability: AppAbility): Promise<void> {
    return this.tasksService.delete(id, ability);
  }
}
