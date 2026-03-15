import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PermissionsRepository } from '@/modules/permissions/repository/permissions.repository';
import { CreatePermissionDto } from '@/modules/permissions/dto/create-permission.dto';
import { UpdatePermissionDto } from '@/modules/permissions/dto/update-permission.dto';
import { PermissionResponseDto } from '@/modules/permissions/dto/permission-response.dto';
import { MANAGE_ALL_PERMISSION_KEY } from '@/common/constants/reserved';

@Injectable()
export class PermissionsService {
  constructor(private readonly permissionsRepository: PermissionsRepository) {}

  async create(createPermissionDto: CreatePermissionDto): Promise<PermissionResponseDto> {
    if (createPermissionDto.key === MANAGE_ALL_PERMISSION_KEY) {
      throw new BadRequestException('Cannot create reserved permission');
    }
    const permission = await this.permissionsRepository.create(createPermissionDto);
    return new PermissionResponseDto(permission);
  }

  async findAll(): Promise<PermissionResponseDto[]> {
    const permissions = await this.permissionsRepository.findAll();
    return permissions.map((permission) => new PermissionResponseDto(permission));
  }

  async findOne(id: string): Promise<PermissionResponseDto | null> {
    const permission = await this.permissionsRepository.findById(id);
    return permission ? new PermissionResponseDto(permission) : null;
  }

  async update(
    id: string,
    updatePermissionDto: UpdatePermissionDto,
  ): Promise<PermissionResponseDto | null> {
    const existing = await this.permissionsRepository.findByIdForCheck(id);
    if (!existing) throw new NotFoundException('Permission not found');
    if (existing.key === MANAGE_ALL_PERMISSION_KEY) {
      throw new BadRequestException('Cannot modify reserved permission');
    }
    const permission = await this.permissionsRepository.update(id, updatePermissionDto);
    return permission ? new PermissionResponseDto(permission) : null;
  }

  async delete(id: string): Promise<void> {
    const existing = await this.permissionsRepository.findByIdForCheck(id);
    if (!existing) throw new NotFoundException('Permission not found');
    if (existing.key === MANAGE_ALL_PERMISSION_KEY) {
      throw new BadRequestException('Cannot delete reserved permission');
    }
    await this.permissionsRepository.delete(id);
  }
}
