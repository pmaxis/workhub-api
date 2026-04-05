import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Action } from '@/common/ability/ability.types';
import type { AppAbility } from '@/common/ability/ability.types';
import { CheckPolicies } from '@/common/decorators/policy.decorator';
import { CurrentUserId } from '@/common/decorators/current-user.decorator';
import { CurrentAbility } from '@/common/decorators/current-ability.decorator';
import { ProjectsService } from '@/modules/projects/service/projects.service';
import { CreateProjectDto } from '@/modules/projects/dto/create-project.dto';
import { UpdateProjectDto } from '@/modules/projects/dto/update-project.dto';
import { QueryProjectsDto } from '@/modules/projects/dto/query-projects.dto';
import { ProjectResponseDto } from '../dto/project-response.dto';
import { PaginatedProjectsResponseDto } from '../dto/paginated-projects-response.dto';

@ApiTags('Projects')
@ApiBearerAuth('access-token')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @ApiOperation({ summary: 'Create project' })
  @ApiCreatedResponse({ type: ProjectResponseDto })
  @CheckPolicies((ability) => ability.can(Action.Create, 'Project'))
  create(
    @Body() dto: CreateProjectDto,
    @CurrentUserId() userId: string,
  ): Promise<ProjectResponseDto> {
    return this.projectsService.create(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List projects (paginated, CASL-filtered)' })
  @ApiOkResponse({ type: PaginatedProjectsResponseDto })
  @CheckPolicies((ability) => ability.can(Action.Read, 'Project'))
  findAll(@Query() query: QueryProjectsDto, @CurrentAbility() ability: AppAbility) {
    return this.projectsService.findAll(ability, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get project by ID' })
  @ApiParam({ name: 'id', description: 'Project ID' })
  @ApiOkResponse({ type: ProjectResponseDto })
  @CheckPolicies((ability) => ability.can(Action.Read, 'Project'))
  findOne(
    @Param('id') id: string,
    @CurrentAbility() ability: AppAbility,
  ): Promise<ProjectResponseDto> {
    return this.projectsService.findOne(id, ability);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update project' })
  @ApiParam({ name: 'id', description: 'Project ID' })
  @ApiOkResponse({ type: ProjectResponseDto })
  @CheckPolicies((ability) => ability.can(Action.Update, 'Project'))
  update(
    @Param('id') id: string,
    @Body() dto: UpdateProjectDto,
    @CurrentAbility() ability: AppAbility,
  ): Promise<ProjectResponseDto> {
    return this.projectsService.update(id, ability, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete project' })
  @ApiParam({ name: 'id', description: 'Project ID' })
  @ApiNoContentResponse({ description: 'Project deleted' })
  @CheckPolicies((ability) => ability.can(Action.Delete, 'Project'))
  delete(@Param('id') id: string, @CurrentAbility() ability: AppAbility): Promise<void> {
    return this.projectsService.delete(id, ability);
  }
}
