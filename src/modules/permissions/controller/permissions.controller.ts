import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode } from '@nestjs/common';
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
import { CheckPolicies } from '@/common/decorators/policy.decorator';
import { CurrentUserId } from '@/common/decorators/current-user.decorator';
import { PermissionsService } from '@/modules/permissions/service/permissions.service';
import { CreatePermissionDto } from '@/modules/permissions/dto/create-permission.dto';
import { UpdatePermissionDto } from '@/modules/permissions/dto/update-permission.dto';
import { PermissionResponseDto } from '../dto/permission-response.dto';

@ApiTags('Permissions')
@ApiBearerAuth('access-token')
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create permission' })
  @ApiCreatedResponse({ type: PermissionResponseDto })
  @CheckPolicies((ability) => ability.can(Action.Create, 'Permission'))
  create(
    @Body() createPermissionDto: CreatePermissionDto,
    @CurrentUserId() actorUserId: string,
  ): Promise<PermissionResponseDto> {
    return this.permissionsService.create(createPermissionDto, actorUserId);
  }

  @Get()
  @ApiOperation({ summary: 'List permissions' })
  @ApiOkResponse({ type: [PermissionResponseDto] })
  @CheckPolicies((ability) => ability.can(Action.Read, 'Permission'))
  findAll(): Promise<PermissionResponseDto[]> {
    return this.permissionsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get permission by ID' })
  @ApiParam({ name: 'id', description: 'Permission ID' })
  @ApiOkResponse({ type: PermissionResponseDto })
  @CheckPolicies((ability) => ability.can(Action.Read, 'Permission'))
  findOne(@Param('id') id: string): Promise<PermissionResponseDto> {
    return this.permissionsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update permission' })
  @ApiParam({ name: 'id', description: 'Permission ID' })
  @ApiOkResponse({ type: PermissionResponseDto })
  @CheckPolicies((ability) => ability.can(Action.Update, 'Permission'))
  update(
    @Param('id') id: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
    @CurrentUserId() actorUserId: string,
  ): Promise<PermissionResponseDto> {
    return this.permissionsService.update(id, updatePermissionDto, actorUserId);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete permission' })
  @ApiParam({ name: 'id', description: 'Permission ID' })
  @ApiNoContentResponse({ description: 'Permission deleted' })
  @CheckPolicies((ability) => ability.can(Action.Delete, 'Permission'))
  delete(@Param('id') id: string, @CurrentUserId() actorUserId: string): Promise<void> {
    return this.permissionsService.delete(id, actorUserId);
  }
}
