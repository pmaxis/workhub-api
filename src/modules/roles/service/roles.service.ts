import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { AdminAuditLogLevel } from '@/infrastructure/database/generated/enums';
import { AdminAuditLogWriterService } from '@/modules/admin-audit-logs/service/admin-audit-log-writer.service';
import { RolesRepository } from '@/modules/roles/repository/roles.repository';
import { CreateRoleDto } from '@/modules/roles/dto/create-role.dto';
import { UpdateRoleDto } from '@/modules/roles/dto/update-role.dto';
import { RoleResponseDto } from '@/modules/roles/dto/role-response.dto';
import { ADMIN_ROLE_SLUG } from '@/common/constants/reserved';

@Injectable()
export class RolesService {
  constructor(
    private readonly rolesRepository: RolesRepository,
    private readonly adminAuditLogWriter: AdminAuditLogWriterService,
  ) {}

  async create(createRoleDto: CreateRoleDto, actorUserId: string): Promise<RoleResponseDto> {
    if (createRoleDto.slug === ADMIN_ROLE_SLUG) {
      throw new BadRequestException('Cannot create reserved role');
    }

    const role = await this.rolesRepository.create(createRoleDto);

    this.adminAuditLogWriter.enqueue({
      level: AdminAuditLogLevel.INFO,
      source: 'roles',
      message: 'Role created',
      actorUserId,
      context: { roleId: role.id, slug: role.slug },
    });

    return new RoleResponseDto(role);
  }

  async findAll(): Promise<RoleResponseDto[]> {
    const roles = await this.rolesRepository.findAll();
    return roles.map((role) => new RoleResponseDto(role));
  }

  async findOne(id: string): Promise<RoleResponseDto> {
    const role = await this.rolesRepository.findOne(id);

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return new RoleResponseDto(role);
  }

  async findIdBySlug(slug: string): Promise<string | null> {
    const role = await this.rolesRepository.findBySlug(slug);
    return role?.id ?? null;
  }

  async update(
    id: string,
    updateRoleDto: UpdateRoleDto,
    actorUserId: string,
  ): Promise<RoleResponseDto> {
    await this.findOne(id);

    if (updateRoleDto.slug === ADMIN_ROLE_SLUG) {
      throw new BadRequestException('Cannot use reserved slug');
    }

    const role = await this.rolesRepository.update(id, updateRoleDto);

    this.adminAuditLogWriter.enqueue({
      level: AdminAuditLogLevel.INFO,
      source: 'roles',
      message: 'Role updated',
      actorUserId,
      context: { roleId: id },
    });

    return new RoleResponseDto(role);
  }

  async delete(id: string, actorUserId: string): Promise<void> {
    await this.findOne(id);

    await this.rolesRepository.delete(id);

    this.adminAuditLogWriter.enqueue({
      level: AdminAuditLogLevel.INFO,
      source: 'roles',
      message: 'Role deleted',
      actorUserId,
      context: { roleId: id },
    });
  }
}
