import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { subject } from '@casl/ability';
import { AppAbility, Action } from '@/common/ability/ability.types';
import { TaskStatus } from '@/infrastructure/database/generated/enums';
import { ProjectsRepository } from '@/modules/projects/repository/projects.repository';
import { TasksRepository } from '@/modules/tasks/repository/tasks.repository';
import { CreateTaskDto } from '@/modules/tasks/dto/create-task.dto';
import { UpdateTaskDto } from '@/modules/tasks/dto/update-task.dto';
import { TaskResponseDto } from '@/modules/tasks/dto/task-response.dto';

@Injectable()
export class TasksService {
  constructor(
    private readonly tasksRepository: TasksRepository,
    private readonly projectsRepository: ProjectsRepository,
  ) {}

  async create(userId: string, ability: AppAbility, dto: CreateTaskDto): Promise<TaskResponseDto> {
    const project = await this.projectsRepository.findOne(dto.projectId, ability);

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const task = await this.tasksRepository.create({
      title: dto.title,
      description: dto.description ?? null,
      status: dto.status ?? TaskStatus.PENDING,
      projectId: dto.projectId,
      projectOwnerId: project.ownerId,
      projectCompanyId: project.companyId,
      assigneeId: userId,
    });

    return new TaskResponseDto(task);
  }

  async findAll(ability: AppAbility, projectId?: string): Promise<TaskResponseDto[]> {
    if (projectId) {
      const project = await this.projectsRepository.findOne(projectId, ability);

      if (!project) {
        throw new NotFoundException('Project not found');
      }
    }

    const tasks = await this.tasksRepository.findAll({ ability, projectId });
    return tasks.map((task) => new TaskResponseDto(task));
  }

  async findOne(id: string, ability: AppAbility): Promise<TaskResponseDto> {
    const task = await this.tasksRepository.findOne(id, ability);

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return new TaskResponseDto(task);
  }

  async update(id: string, ability: AppAbility, dto: UpdateTaskDto): Promise<TaskResponseDto> {
    const task = await this.tasksRepository.findOne(id, ability);

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (!ability.can(Action.Update, subject('Task', task))) {
      throw new ForbiddenException();
    }

    if (Object.keys(dto).length === 0) {
      return new TaskResponseDto(task);
    }

    const updated = await this.tasksRepository.update(id, dto);

    return new TaskResponseDto(updated);
  }

  async delete(id: string, ability: AppAbility): Promise<void> {
    const task = await this.tasksRepository.findOne(id, ability);

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (!ability.can(Action.Delete, subject('Task', task))) {
      throw new ForbiddenException();
    }

    await this.tasksRepository.delete(id);
  }
}
