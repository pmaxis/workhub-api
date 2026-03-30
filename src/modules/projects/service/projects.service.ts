import { Injectable, NotFoundException } from '@nestjs/common';
import { ProjectsRepository } from '@/modules/projects/repository/projects.repository';
import { CreateProjectDto } from '@/modules/projects/dto/create-project.dto';
import { UpdateProjectDto } from '@/modules/projects/dto/update-project.dto';
import { ProjectResponseDto } from '@/modules/projects/dto/project-response.dto';

@Injectable()
export class ProjectsService {
  constructor(private readonly projectsRepository: ProjectsRepository) {}

  async create(userId: string, dto: CreateProjectDto): Promise<ProjectResponseDto> {
    const project = await this.projectsRepository.create({
      name: dto.name,
      description: dto.description,
      ownerId: userId,
    });

    return new ProjectResponseDto(project);
  }

  async findAll(userId: string): Promise<ProjectResponseDto[]> {
    const projects = await this.projectsRepository.findAll(userId);
    return projects.map((project) => new ProjectResponseDto(project));
  }

  async findOne(userId: string, id: string): Promise<ProjectResponseDto> {
    const project = await this.projectsRepository.findOne(id, userId);

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return new ProjectResponseDto(project);
  }

  async update(userId: string, id: string, dto: UpdateProjectDto): Promise<ProjectResponseDto> {
    const current = await this.findOne(userId, id);

    if (Object.keys(dto).length === 0) return current;

    const project = await this.projectsRepository.update(id, dto);

    return new ProjectResponseDto(project);
  }

  async delete(userId: string, id: string): Promise<void> {
    await this.findOne(userId, id);

    await this.projectsRepository.delete(id);
  }
}
