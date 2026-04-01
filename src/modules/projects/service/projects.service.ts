import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { subject } from '@casl/ability';
import { AppAbility, Action } from '@/common/ability/ability.types';
import {
  ProjectsRepository,
  PaginatedResult,
} from '@/modules/projects/repository/projects.repository';
import { CreateProjectDto } from '@/modules/projects/dto/create-project.dto';
import { UpdateProjectDto } from '@/modules/projects/dto/update-project.dto';
import { QueryProjectsDto } from '@/modules/projects/dto/query-projects.dto';
import { ProjectResponseDto } from '@/modules/projects/dto/project-response.dto';

@Injectable()
export class ProjectsService {
  constructor(private readonly projectsRepository: ProjectsRepository) {}

  async create(userId: string, dto: CreateProjectDto): Promise<ProjectResponseDto> {
    const project = await this.projectsRepository.create({
      name: dto.name,
      description: dto.description,
      ownerId: userId,
      companyId: dto.companyId,
    });

    return new ProjectResponseDto(project);
  }

  async findAll(
    ability: AppAbility,
    query: QueryProjectsDto,
  ): Promise<PaginatedResult<ProjectResponseDto>> {
    const result = await this.projectsRepository.findAll({
      ability,
      search: query.search,
      companyId: query.companyId,
      page: query.page ?? 1,
      limit: query.limit ?? 20,
    });

    return {
      ...result,
      data: result.data.map((p) => new ProjectResponseDto(p)),
    };
  }

  async findOne(id: string, ability: AppAbility): Promise<ProjectResponseDto> {
    const project = await this.projectsRepository.findOne(id, ability);

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return new ProjectResponseDto(project);
  }

  async update(
    id: string,
    ability: AppAbility,
    dto: UpdateProjectDto,
  ): Promise<ProjectResponseDto> {
    const project = await this.projectsRepository.findOne(id, ability);

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (!ability.can(Action.Update, subject('Project', project))) {
      throw new ForbiddenException();
    }

    if (Object.keys(dto).length === 0) return new ProjectResponseDto(project);

    const updated = await this.projectsRepository.update(id, dto);

    return new ProjectResponseDto(updated);
  }

  async delete(id: string, ability: AppAbility): Promise<void> {
    const project = await this.projectsRepository.findOne(id, ability);

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (!ability.can(Action.Delete, subject('Project', project))) {
      throw new ForbiddenException();
    }

    await this.projectsRepository.delete(id);
  }
}
