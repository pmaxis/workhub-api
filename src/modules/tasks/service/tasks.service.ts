import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { subject } from '@casl/ability';
import { AppAbility, Action } from '@/common/ability/ability.types';
import { TaskStatus } from '@/infrastructure/database/generated/enums';
import { ProjectsRepository } from '@/modules/projects/repository/projects.repository';
import { TasksRepository } from '@/modules/tasks/repository/tasks.repository';
import { NotificationsRepository } from '@/modules/notifications/repository/notifications.repository';
import { CreateTaskDto } from '@/modules/tasks/dto/create-task.dto';
import { UpdateTaskDto } from '@/modules/tasks/dto/update-task.dto';
import { TaskResponseDto } from '@/modules/tasks/dto/task-response.dto';

@Injectable()
export class TasksService {
  constructor(
    private readonly tasksRepository: TasksRepository,
    private readonly projectsRepository: ProjectsRepository,
    private readonly notificationsRepository: NotificationsRepository,
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

    await this.notifyTaskCreated(task);
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

    const prevStatus = task.status;
    const updated = await this.tasksRepository.update(id, dto);

    if (dto.status && dto.status !== prevStatus) {
      await this.notifyTaskStatusChanged(updated, prevStatus, updated.status);
    }

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

  private async notifyTaskCreated(task: {
    id: string;
    title: string;
    status: TaskStatus;
    projectId: string;
    projectOwnerId: string;
    projectCompanyId: string | null;
    assigneeId: string;
  }): Promise<void> {
    const recipients = new Set<string>([task.assigneeId, task.projectOwnerId].filter(Boolean));
    const title = 'Task created';
    const body = `${task.title} (${task.status})`;
    const data = { kind: 'task.created', taskId: task.id, projectId: task.projectId };

    await Promise.all(
      Array.from(recipients).map((userId) =>
        this.notificationsRepository.create({
          userId,
          type: 'SYSTEM',
          title,
          body,
          data,
        }),
      ),
    );
  }

  private async notifyTaskStatusChanged(
    task: {
      id: string;
      title: string;
      projectId: string;
      projectOwnerId: string;
      assigneeId: string;
    },
    from: TaskStatus,
    to: TaskStatus,
  ): Promise<void> {
    const recipients = new Set<string>([task.assigneeId, task.projectOwnerId].filter(Boolean));
    const title = 'Task status changed';
    const body = `${task.title}: ${from} → ${to}`;
    const data = {
      kind: 'task.status_changed',
      taskId: task.id,
      projectId: task.projectId,
      from,
      to,
    };

    await Promise.all(
      Array.from(recipients).map((userId) =>
        this.notificationsRepository.create({
          userId,
          type: 'SYSTEM',
          title,
          body,
          data,
        }),
      ),
    );
  }
}
