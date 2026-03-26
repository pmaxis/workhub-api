import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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

  private async requireFreelancerProfileId(userId: string): Promise<string> {
    const profile = await this.database.freelancerProfile.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!profile) {
      throw new ForbiddenException('A freelancer profile is required for this action');
    }
    return profile.id;
  }

  private toDto(row: {
    id: string;
    name: string;
    description: string | null;
    clientProfileId: string | null;
    createdAt: Date;
    updatedAt: Date;
    _count?: { tasks: number };
  }): ProjectResponseDto {
    return new ProjectResponseDto({
      id: row.id,
      name: row.name,
      description: row.description,
      clientProfileId: row.clientProfileId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      tasksCount: row._count?.tasks,
    });
  }

  private async assertClientLinked(
    freelancerProfileId: string,
    clientProfileId: string,
  ): Promise<void> {
    const rel = await this.database.clientRelation.findUnique({
      where: {
        freelancerProfileId_clientProfileId: {
          freelancerProfileId,
          clientProfileId,
        },
      },
    });
    if (!rel) {
      throw new BadRequestException('Client is not linked to your account');
    }
  }

  async create(userId: string, dto: CreateProjectDto): Promise<ProjectResponseDto> {
    const freelancerProfileId = await this.requireFreelancerProfileId(userId);
    if (dto.clientProfileId) {
      await this.assertClientLinked(freelancerProfileId, dto.clientProfileId);
    }
    const row = await this.projectsRepository.create({
      name: dto.name,
      description: dto.description,
      freelancerProfileId,
      clientProfileId: dto.clientProfileId,
    });
    return this.toDto(row);
  }

  async findAll(userId: string): Promise<ProjectResponseDto[]> {
    const freelancerProfileId = await this.requireFreelancerProfileId(userId);
    const rows = await this.projectsRepository.findManyByFreelancer(freelancerProfileId);
    return rows.map((r) => this.toDto(r));
  }

  async findOne(userId: string, id: string): Promise<ProjectResponseDto> {
    const freelancerProfileId = await this.requireFreelancerProfileId(userId);
    const row = await this.projectsRepository.findByIdForFreelancer(id, freelancerProfileId);
    if (!row) throw new NotFoundException('Project not found');
    return this.toDto(row);
  }

  async update(userId: string, id: string, dto: UpdateProjectDto): Promise<ProjectResponseDto> {
    const freelancerProfileId = await this.requireFreelancerProfileId(userId);
    const existing = await this.projectsRepository.findByIdForFreelancer(id, freelancerProfileId);
    if (!existing) throw new NotFoundException('Project not found');

    if (dto.clientProfileId !== undefined && dto.clientProfileId !== null) {
      await this.assertClientLinked(freelancerProfileId, dto.clientProfileId);
    }

    const data: { name?: string; description?: string | null; clientProfileId?: string | null } =
      {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.clientProfileId !== undefined) data.clientProfileId = dto.clientProfileId;

    if (Object.keys(data).length === 0) {
      return this.toDto(existing);
    }

    const row = await this.projectsRepository.update(id, data);
    return this.toDto(row);
  }

  async remove(userId: string, id: string): Promise<void> {
    const freelancerProfileId = await this.requireFreelancerProfileId(userId);
    const existing = await this.projectsRepository.findByIdForFreelancer(id, freelancerProfileId);
    if (!existing) throw new NotFoundException('Project not found');

    await this.database.$transaction(async (tx) => {
      await tx.task.deleteMany({ where: { projectId: id } });
      await tx.project.delete({ where: { id } });
    });
  }
}
