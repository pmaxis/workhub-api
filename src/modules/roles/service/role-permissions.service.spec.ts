import { Test, TestingModule } from '@nestjs/testing';
import { RolePermissionsService } from '@/modules/roles/service/role-permissions.service';
import { RolePermissionsRepository } from '@/modules/roles/repository/role-permissions.repository';

const mockRolePermission = {
  roleId: 'role-id',
  permissionId: 'permission-id',
};

describe('RolePermissionsService', () => {
  let service: RolePermissionsService;

  const mockRolePermissionsRepository = {
    addPermission: jest.fn(),
    deletePermission: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolePermissionsService,
        {
          provide: RolePermissionsRepository,
          useValue: mockRolePermissionsRepository,
        },
      ],
    }).compile();

    service = module.get<RolePermissionsService>(RolePermissionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addPermission', () => {
    it('should add permission to role', async () => {
      mockRolePermissionsRepository.addPermission.mockResolvedValue(mockRolePermission);

      const result = await service.addPermission('role-id', 'permission-id');

      expect(mockRolePermissionsRepository.addPermission).toHaveBeenCalledWith({
        roleId: 'role-id',
        permissionId: 'permission-id',
      });
      expect(result).toEqual(mockRolePermission);
    });
  });

  describe('deletePermission', () => {
    it('should delete permission from role', async () => {
      mockRolePermissionsRepository.deletePermission.mockResolvedValue(mockRolePermission);

      const result = await service.deletePermission('role-id', 'permission-id');

      expect(mockRolePermissionsRepository.deletePermission).toHaveBeenCalledWith(
        'role-id',
        'permission-id',
      );
      expect(result).toEqual(mockRolePermission);
    });
  });
});
