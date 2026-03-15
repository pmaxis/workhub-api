import { Test, TestingModule } from '@nestjs/testing';
import { RolePermissionsService } from '@/modules/roles/service/role-permissions.service';
import { RolePermissionsRepository } from '@/modules/roles/repository/role-permissions.repository';
import { PermissionsRepository } from '@/modules/permissions/repository/permissions.repository';

describe('RolePermissionsService', () => {
  let service: RolePermissionsService;

  const mockRolePermissionsRepository = {
    addPermission: jest.fn(),
    deletePermission: jest.fn(),
  };

  const mockPermissionsRepository = {
    findByIdForCheck: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    mockPermissionsRepository.findByIdForCheck.mockResolvedValue({
      id: 'permission-id',
      key: 'users.read',
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolePermissionsService,
        { provide: RolePermissionsRepository, useValue: mockRolePermissionsRepository },
        { provide: PermissionsRepository, useValue: mockPermissionsRepository },
      ],
    }).compile();

    service = module.get<RolePermissionsService>(RolePermissionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addPermission', () => {
    it('should add permission to role', async () => {
      mockRolePermissionsRepository.addPermission.mockResolvedValue(undefined);

      await service.addPermission('role-id', 'permission-id');

      expect(mockPermissionsRepository.findByIdForCheck).toHaveBeenCalledWith('permission-id');
      expect(mockRolePermissionsRepository.addPermission).toHaveBeenCalledWith({
        roleId: 'role-id',
        permissionId: 'permission-id',
      });
    });
  });

  describe('deletePermission', () => {
    it('should delete permission from role', async () => {
      mockRolePermissionsRepository.deletePermission.mockResolvedValue(undefined);

      await service.deletePermission('role-id', 'permission-id');

      expect(mockPermissionsRepository.findByIdForCheck).toHaveBeenCalledWith('permission-id');
      expect(mockRolePermissionsRepository.deletePermission).toHaveBeenCalledWith(
        'role-id',
        'permission-id',
      );
    });
  });
});
