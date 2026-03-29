import { Test, TestingModule } from '@nestjs/testing';
import { RolePermissionsController } from '@/modules/roles/controller/role-permissions.controller';
import { RolePermissionsService } from '@/modules/roles/service/role-permissions.service';
import { AddPermissionDto } from '@/modules/roles/dto/add-permission.dto';

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
      mockRolePermissionsService.addPermission.mockResolvedValue(undefined);
      const dto: AddPermissionDto = { permissionId: 'permission-id' };

      await controller.addPermission('role-id', dto);

      expect(mockRolePermissionsService.addPermission).toHaveBeenCalledWith(
        'role-id',
        'permission-id',
      );
    });
  });

  describe('deletePermission', () => {
    it('should delete permission from role', async () => {
      mockRolePermissionsService.deletePermission.mockResolvedValue(undefined);

      await controller.deletePermission('role-id', 'permission-id');

      expect(mockRolePermissionsService.deletePermission).toHaveBeenCalledWith(
        'role-id',
        'permission-id',
      );
    });
  });
});
