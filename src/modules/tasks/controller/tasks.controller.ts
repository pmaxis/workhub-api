import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query } from '@nestjs/common';
import { Action } from '@/common/ability/ability.types';
import { CheckPolicies } from '@/common/decorators/policy.decorator';
import { CurrentUserId } from '@/common/decorators/current-user.decorator';
import { TasksService } from '@/modules/tasks/service/tasks.service';
import { CreateTaskDto } from '@/modules/tasks/dto/create-task.dto';
import { UpdateTaskDto } from '@/modules/tasks/dto/update-task.dto';
import { TaskResponseDto } from '@/modules/tasks/dto/task-response.dto';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @CheckPolicies((ability) => ability.can(Action.Create, 'Task'))
  create(@Body() dto: CreateTaskDto, @CurrentUserId() userId: string): Promise<TaskResponseDto> {
    return this.tasksService.create(userId, dto);
  }

  @Get()
  @CheckPolicies((ability) => ability.can(Action.Read, 'Task'))
  findAll(
    @CurrentUserId() userId: string,
    @Query('projectId') projectId?: string,
  ): Promise<TaskResponseDto[]> {
    return this.tasksService.findAll(userId, projectId);
  }

  @Get(':id')
  @CheckPolicies((ability) => ability.can(Action.Read, 'Task'))
  findOne(@Param('id') id: string, @CurrentUserId() userId: string): Promise<TaskResponseDto> {
    return this.tasksService.findOne(userId, id);
  }

  @Patch(':id')
  @CheckPolicies((ability) => ability.can(Action.Update, 'Task'))
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
    @CurrentUserId() userId: string,
  ): Promise<TaskResponseDto> {
    return this.tasksService.update(userId, id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @CheckPolicies((ability) => ability.can(Action.Delete, 'Task'))
  delete(@Param('id') id: string, @CurrentUserId() userId: string): Promise<void> {
    return this.tasksService.delete(userId, id);
  }
}
