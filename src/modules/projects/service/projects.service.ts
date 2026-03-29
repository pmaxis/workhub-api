import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '@/infrastructure/database/database.service';
import { ProjectsRepository } from '@/modules/projects/repository/projects.repository';
import { CreateProjectDto } from '@/modules/projects/dto/create-project.dto';
import { UpdateProjectDto } from '@/modules/projects/dto/update-project.dto';
import { ProjectResponseDto } from '@/modules/projects/dto/project-response.dto';

@Injectable()
export class ProjectsService {
  constructor(
    private readonly projectsRepository: ProjectsRepository,
    private readonly database: DatabaseService,
  ) {}

  private toDto(row: {
    id: string;
    name: string;
    description: string | null;
    ownerId: string;
    createdAt: Date;
    updatedAt: Date;
    _count?: { tasks: number };
  }): ProjectResponseDto {
    return new ProjectResponseDto({
      id: row.id,
      name: row.name,
      description: row.description,
      ownerId: row.ownerId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      tasksCount: row._count?.tasks,
    });
  }

  async create(userId: string, dto: CreateProjectDto): Promise<ProjectResponseDto> {
    const row = await this.projectsRepository.create({
      name: dto.name,
      description: dto.description,
      ownerId: userId,
    });
    return this.toDto(row);
  }

  async findAll(userId: string): Promise<ProjectResponseDto[]> {
    const rows = await this.projectsRepository.findManyByOwner(userId);
    return rows.map((r) => this.toDto(r));
  }

  async findOne(userId: string, id: string): Promise<ProjectResponseDto> {
    const row = await this.projectsRepository.findByIdForOwner(id, userId);
    if (!row) throw new NotFoundException('Project not found');
    return this.toDto(row);
  }

  async update(userId: string, id: string, dto: UpdateProjectDto): Promise<ProjectResponseDto> {
    const existing = await this.projectsRepository.findByIdForOwner(id, userId);
    if (!existing) throw new NotFoundException('Project not found');

    const data: { name?: string; description?: string | null } = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.description !== undefined) data.description = dto.description;

    if (Object.keys(data).length === 0) {
      return this.toDto(existing);
    }

    const row = await this.projectsRepository.update(id, data);
    return this.toDto(row);
  }

  async remove(userId: string, id: string): Promise<void> {
    const existing = await this.projectsRepository.findByIdForOwner(id, userId);
    if (!existing) throw new NotFoundException('Project not found');

    await this.database.$transaction(async (tx) => {
      await tx.task.deleteMany({ where: { projectId: id } });
      await tx.project.delete({ where: { id } });
    });
  }
}
