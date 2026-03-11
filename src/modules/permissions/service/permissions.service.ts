import { Injectable } from '@nestjs/common';
import { CreatePermissionDto } from '@/modules/permissions/dto/create-permission.dto';
import { UpdatePermissionDto } from '@/modules/permissions/dto/update-permission.dto';
import { PermissionsRepository } from '../repository/permissions.repository';

@Injectable()
export class PermissionsService {
  constructor(private readonly permissionsRepository: PermissionsRepository) {}

  create(createPermissionDto: CreatePermissionDto) {
    return this.permissionsRepository.create(createPermissionDto);
  }

  findAll() {
    return this.permissionsRepository.findAll();
  }

  findOne(id: string) {
    return this.permissionsRepository.findById(id);
  }

  update(id: string, updatePermissionDto: UpdatePermissionDto) {
    return this.permissionsRepository.update(id, updatePermissionDto);
  }

  delete(id: string) {
    return this.permissionsRepository.delete(id);
  }
}
