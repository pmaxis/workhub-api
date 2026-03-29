import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { RolesRepository } from '@/modules/roles/repository/roles.repository';
import { CreateRoleDto } from '@/modules/roles/dto/create-role.dto';
import { UpdateRoleDto } from '@/modules/roles/dto/update-role.dto';
import { RoleResponseDto } from '@/modules/roles/dto/role-response.dto';
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
    return roles.map((role) => new RoleResponseDto(role));
  }

  async findOne(id: string): Promise<RoleResponseDto> {
    const role = await this.rolesRepository.findOne(id);

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return new RoleResponseDto(role);
  }

  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<RoleResponseDto> {
    await this.findOne(id);

    if (updateRoleDto.slug === ADMIN_ROLE_SLUG) {
      throw new BadRequestException('Cannot use reserved slug');
    }

    const role = await this.rolesRepository.update(id, updateRoleDto);

    return new RoleResponseDto(role);
  }

  async delete(id: string): Promise<void> {
    await this.findOne(id);

    await this.rolesRepository.delete(id);
  }
}
