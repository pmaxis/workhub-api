import { Test, TestingModule } from '@nestjs/testing';
import { RolePermissionsController } from '@/modules/roles/controller/role-permissions.controller';
import { RolePermissionsService } from '@/modules/roles/service/role-permissions.service';

const mockRolePermission = {
  roleId: 'role-id',
  permissionId: 'permission-id',
};

describe('RolePermissionsController', () => {
  let controller: RolePermissionsController;

  const mockRolePermissionsService = {
    addPermission: jest.fn(),
    deletePermission: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RolePermissionsController],
      providers: [
        {
          provide: RolePermissionsService,
          useValue: mockRolePermissionsService,
        },
      ],
    }).compile();

    controller = module.get<RolePermissionsController>(RolePermissionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('addPermission', () => {
    it('should add permission to role', async () => {
      mockRolePermissionsService.addPermission.mockResolvedValue(mockRolePermission);

      const result = await controller.addPermission('role-id', {
        permissionId: 'permission-id',
      });

      expect(mockRolePermissionsService.addPermission).toHaveBeenCalledWith(
        'role-id',
        'permission-id',
      );
      expect(result).toEqual(mockRolePermission);
    });
  });

  describe('deletePermission', () => {
    it('should delete permission from role', async () => {
      mockRolePermissionsService.deletePermission.mockResolvedValue(mockRolePermission);

      const result = await controller.deletePermission('role-id', 'permission-id');

      expect(mockRolePermissionsService.deletePermission).toHaveBeenCalledWith(
        'role-id',
        'permission-id',
      );
      expect(result).toEqual(mockRolePermission);
    });
  });
});
