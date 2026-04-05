import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Action } from '@/common/ability/ability.types';
import type { AppAbility } from '@/common/ability/ability.types';
import { CheckPolicies } from '@/common/decorators/policy.decorator';
import { CurrentUserId } from '@/common/decorators/current-user.decorator';
import { CurrentAbility } from '@/common/decorators/current-ability.decorator';
import { TasksService } from '@/modules/tasks/service/tasks.service';
import { CreateTaskDto } from '@/modules/tasks/dto/create-task.dto';
import { UpdateTaskDto } from '@/modules/tasks/dto/update-task.dto';
import { TaskResponseDto } from '@/modules/tasks/dto/task-response.dto';

@ApiTags('Tasks')
@ApiBearerAuth('access-token')
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: 'Create task' })
  @ApiCreatedResponse({ type: TaskResponseDto })
  @CheckPolicies((ability) => ability.can(Action.Create, 'Task'))
  create(
    @Body() dto: CreateTaskDto,
    @CurrentUserId() userId: string,
    @CurrentAbility() ability: AppAbility,
  ): Promise<TaskResponseDto> {
    return this.tasksService.create(userId, ability, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List tasks (optionally filtered by project)' })
  @ApiQuery({ name: 'projectId', required: false, description: 'Filter by project ID' })
  @ApiOkResponse({ type: [TaskResponseDto] })
  @CheckPolicies((ability) => ability.can(Action.Read, 'Task'))
  findAll(
    @Query('projectId') projectId: string | undefined,
    @CurrentAbility() ability: AppAbility,
  ): Promise<TaskResponseDto[]> {
    return this.tasksService.findAll(ability, projectId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get task by ID' })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiOkResponse({ type: TaskResponseDto })
  @CheckPolicies((ability) => ability.can(Action.Read, 'Task'))
  findOne(
    @Param('id') id: string,
    @CurrentAbility() ability: AppAbility,
  ): Promise<TaskResponseDto> {
    return this.tasksService.findOne(id, ability);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update task' })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiOkResponse({ type: TaskResponseDto })
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
  @ApiOperation({ summary: 'Delete task' })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiNoContentResponse({ description: 'Task deleted' })
  @CheckPolicies((ability) => ability.can(Action.Delete, 'Task'))
  delete(@Param('id') id: string, @CurrentAbility() ability: AppAbility): Promise<void> {
    return this.tasksService.delete(id, ability);
  }
}
