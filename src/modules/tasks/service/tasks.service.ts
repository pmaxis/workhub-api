import { Injectable, NotFoundException } from '@nestjs/common';
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

  async create(userId: string, dto: CreateTaskDto): Promise<TaskResponseDto> {
    const project = await this.projectsRepository.findOne(dto.projectId, userId);

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const task = await this.tasksRepository.create({
      title: dto.title,
      description: dto.description ?? null,
      status: dto.status ?? TaskStatus.PENDING,
      projectId: dto.projectId,
      assigneeId: userId,
    });

    return new TaskResponseDto(task);
  }

  async findAll(userId: string, projectId?: string): Promise<TaskResponseDto[]> {
    if (projectId) {
      const project = await this.projectsRepository.findOne(projectId, userId);

      if (!project) {
        throw new NotFoundException('Project not found');
      }
    }

    const tasks = await this.tasksRepository.findAll(userId, projectId);
    return tasks.map((task) => new TaskResponseDto(task));
  }

  async findOne(userId: string, id: string): Promise<TaskResponseDto> {
    const task = await this.tasksRepository.findOne(id, userId);

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return new TaskResponseDto(task);
  }

  async update(userId: string, id: string, dto: UpdateTaskDto): Promise<TaskResponseDto> {
    const current = await this.findOne(userId, id);

    if (Object.keys(dto).length === 0) return current;

    const task = await this.tasksRepository.update(id, dto);

    return new TaskResponseDto(task);
  }

  async delete(userId: string, id: string): Promise<void> {
    await this.findOne(userId, id);
    await this.tasksRepository.delete(id);
  }
}
