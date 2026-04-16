import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { AdminAuditLogLevel } from '@/infrastructure/database/generated/enums';
import { AdminAuditLogWriterService } from '@/modules/admin-audit-logs/service/admin-audit-log-writer.service';
import { PermissionsRepository } from '@/modules/permissions/repository/permissions.repository';
import { CreatePermissionDto } from '@/modules/permissions/dto/create-permission.dto';
import { UpdatePermissionDto } from '@/modules/permissions/dto/update-permission.dto';
import { PermissionResponseDto } from '@/modules/permissions/dto/permission-response.dto';
import { MANAGE_ALL_PERMISSION_KEY } from '@/common/constants/reserved';

@Injectable()
export class PermissionsService {
  constructor(
    private readonly permissionsRepository: PermissionsRepository,
    private readonly adminAuditLogWriter: AdminAuditLogWriterService,
  ) {}

  async create(
    createPermissionDto: CreatePermissionDto,
    actorUserId: string,
  ): Promise<PermissionResponseDto> {
    if (createPermissionDto.key === MANAGE_ALL_PERMISSION_KEY) {
      throw new BadRequestException('Cannot create reserved permission');
    }

    const permission = await this.permissionsRepository.create(createPermissionDto);

    this.adminAuditLogWriter.enqueue({
      level: AdminAuditLogLevel.INFO,
      source: 'permissions',
      message: 'Permission created',
      actorUserId,
      context: { permissionId: permission.id, key: permission.key },
    });

    return new PermissionResponseDto(permission);
  }

  async findAll(): Promise<PermissionResponseDto[]> {
    const permissions = await this.permissionsRepository.findAll();
    return permissions.map((permission) => new PermissionResponseDto(permission));
  }

  async findOne(id: string): Promise<PermissionResponseDto> {
    const permission = await this.permissionsRepository.findOne(id);

    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    return new PermissionResponseDto(permission);
  }

  async update(
    id: string,
    updatePermissionDto: UpdatePermissionDto,
    actorUserId: string,
  ): Promise<PermissionResponseDto> {
    await this.findOne(id);

    if (updatePermissionDto.key === MANAGE_ALL_PERMISSION_KEY) {
      throw new BadRequestException('Cannot use reserved key');
    }

    const permission = await this.permissionsRepository.update(id, updatePermissionDto);

    this.adminAuditLogWriter.enqueue({
      level: AdminAuditLogLevel.INFO,
      source: 'permissions',
      message: 'Permission updated',
      actorUserId,
      context: { permissionId: id },
    });

    return new PermissionResponseDto(permission);
  }

  async delete(id: string, actorUserId: string): Promise<void> {
    await this.findOne(id);

    await this.permissionsRepository.delete(id);

    this.adminAuditLogWriter.enqueue({
      level: AdminAuditLogLevel.INFO,
      source: 'permissions',
      message: 'Permission deleted',
      actorUserId,
      context: { permissionId: id },
    });
  }
}
