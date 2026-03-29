import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
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

  private toDto(row: {
    id: string;
    title: string;
    description: string | null;
    status: string;
    projectId: string;
    assigneeId: string;
    createdAt: Date;
    updatedAt: Date;
  }): TaskResponseDto {
    return new TaskResponseDto({
      id: row.id,
      title: row.title,
      description: row.description,
      status: row.status,
      projectId: row.projectId,
      assigneeId: row.assigneeId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  async create(userId: string, dto: CreateTaskDto): Promise<TaskResponseDto> {
    const project = await this.projectsRepository.findByIdForOwner(dto.projectId, userId);
    if (!project) throw new NotFoundException('Project not found');

    const assigneeId = dto.assigneeId ?? userId;
    if (assigneeId !== userId) {
      throw new BadRequestException('You can only assign tasks to yourself');
    }

    const row = await this.tasksRepository.create({
      title: dto.title,
      description: dto.description ?? null,
      status: dto.status ?? TaskStatus.PENDING,
      projectId: dto.projectId,
      assigneeId,
    });
    return this.toDto(row);
  }

  async findAll(userId: string, projectId?: string): Promise<TaskResponseDto[]> {
    if (projectId) {
      const project = await this.projectsRepository.findByIdForOwner(projectId, userId);
      if (!project) throw new NotFoundException('Project not found');
    }
    const rows = await this.tasksRepository.findManyByProjectOwner(userId, projectId);
    return rows.map((r) => this.toDto(r));
  }

  async findOne(userId: string, id: string): Promise<TaskResponseDto> {
    const row = await this.tasksRepository.findByIdForProjectOwner(id, userId);
    if (!row) throw new NotFoundException('Task not found');
    return this.toDto(row);
  }

  async update(userId: string, id: string, dto: UpdateTaskDto): Promise<TaskResponseDto> {
    const existing = await this.tasksRepository.findByIdForProjectOwner(id, userId);
    if (!existing) throw new NotFoundException('Task not found');

    const data: {
      title?: string;
      description?: string | null;
      status?: TaskStatus;
    } = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.status !== undefined) data.status = dto.status;

    if (Object.keys(data).length === 0) {
      return this.toDto(existing);
    }

    const row = await this.tasksRepository.update(id, data);
    return this.toDto(row);
  }

  async remove(userId: string, id: string): Promise<void> {
    const existing = await this.tasksRepository.findByIdForProjectOwner(id, userId);
    if (!existing) throw new NotFoundException('Task not found');
    await this.tasksRepository.delete(id);
  }
}
