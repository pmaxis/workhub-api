import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post } from '@nestjs/common';
import { Action } from '@/common/ability/ability.types';
import { CheckPolicies } from '@/common/decorators/policy.decorator';
import { CurrentUserId } from '@/common/decorators/current-user.decorator';
import { ProjectsService } from '@/modules/projects/service/projects.service';
import { CreateProjectDto } from '@/modules/projects/dto/create-project.dto';
import { UpdateProjectDto } from '@/modules/projects/dto/update-project.dto';
import { ProjectResponseDto } from '../dto/project-response.dto';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @CheckPolicies((ability) => ability.can(Action.Create, 'Project'))
  create(
    @Body() dto: CreateProjectDto,
    @CurrentUserId() userId: string,
  ): Promise<ProjectResponseDto> {
    return this.projectsService.create(userId, dto);
  }

  @Get()
  @CheckPolicies((ability) => ability.can(Action.Read, 'Project'))
  findAll(@CurrentUserId() userId: string): Promise<ProjectResponseDto[]> {
    return this.projectsService.findAll(userId);
  }

  @Get(':id')
  @CheckPolicies((ability) => ability.can(Action.Read, 'Project'))
  findOne(@Param('id') id: string, @CurrentUserId() userId: string): Promise<ProjectResponseDto> {
    return this.projectsService.findOne(userId, id);
  }

  @Patch(':id')
  @CheckPolicies((ability) => ability.can(Action.Update, 'Project'))
  update(
    @Param('id') id: string,
    @Body() dto: UpdateProjectDto,
    @CurrentUserId() userId: string,
  ): Promise<ProjectResponseDto> {
    return this.projectsService.update(userId, id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @CheckPolicies((ability) => ability.can(Action.Delete, 'Project'))
  delete(@Param('id') id: string, @CurrentUserId() userId: string): Promise<void> {
    return this.projectsService.delete(userId, id);
  }
}
