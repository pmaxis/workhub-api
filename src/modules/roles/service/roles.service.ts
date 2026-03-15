import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { RolesRepository } from '@/modules/roles/repository/roles.repository';
import { CreateRoleDto } from '@/modules/roles/dto/create-role.dto';
import { UpdateRoleDto } from '@/modules/roles/dto/update-role.dto';
import { RoleResponseDto } from '@/modules/roles/dto/role-response.dto';
import { PermissionResponseDto } from '@/modules/permissions/dto/permission-response.dto';
import { ADMIN_ROLE_SLUG } from '@/common/constants/reserved';

@Injectable()
export class RolesService {
  constructor(private readonly rolesRepository: RolesRepository) {}

  async create(createRoleDto: CreateRoleDto): Promise<RoleResponseDto> {
    if (createRoleDto.slug === ADMIN_ROLE_SLUG) {
      throw new BadRequestException('Cannot create reserved role');
    }
    const role = await this.rolesRepository.create(createRoleDto);
    return new RoleResponseDto(role);
  }

  async findAll(): Promise<RoleResponseDto[]> {
    const roles = await this.rolesRepository.findAll();
    return roles.map(
      (role) =>
        new RoleResponseDto({
          ...role,
          permissions: role.permissions.map((rp) => new PermissionResponseDto(rp.permission)),
        }),
    );
  }

  async findOne(id: string): Promise<RoleResponseDto | null> {
    const role = await this.rolesRepository.findById(id);
    if (!role) return null;
    return new RoleResponseDto({
      ...role,
      permissions: role.permissions.map((rp) => new PermissionResponseDto(rp.permission)),
    });
  }

  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<RoleResponseDto | null> {
    const existing = await this.rolesRepository.findByIdForCheck(id);
    if (!existing) throw new NotFoundException('Role not found');
    if (existing.slug === ADMIN_ROLE_SLUG) {
      throw new BadRequestException('Cannot modify reserved role');
    }
    const role = await this.rolesRepository.update(id, updateRoleDto);
    return new RoleResponseDto({
      ...role,
      permissions: role.permissions.map((rp) => new PermissionResponseDto(rp.permission)),
    });
  }

  async delete(id: string): Promise<void> {
    const existing = await this.rolesRepository.findByIdForCheck(id);
    if (!existing) throw new NotFoundException('Role not found');
    if (existing.slug === ADMIN_ROLE_SLUG) {
      throw new BadRequestException('Cannot delete reserved role');
    }
    await this.rolesRepository.delete(id);
  }
}
