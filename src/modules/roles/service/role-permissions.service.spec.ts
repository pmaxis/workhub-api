import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AdminAuditLogWriterService } from '@/modules/admin-audit-logs/service/admin-audit-log-writer.service';
import { RolePermissionsService } from '@/modules/roles/service/role-permissions.service';
import { RolePermissionsRepository } from '@/modules/roles/repository/role-permissions.repository';
import { RolesService } from '@/modules/roles/service/roles.service';
import { PermissionsService } from '@/modules/permissions/service/permissions.service';
import { RoleResponseDto } from '@/modules/roles/dto/role-response.dto';
import { PermissionResponseDto } from '@/modules/permissions/dto/permission-response.dto';
import { MANAGE_ALL_PERMISSION_KEY } from '@/common/constants/reserved';

describe('RolePermissionsService', () => {
  let service: RolePermissionsService;

  const mockRolePermissionsRepository = {
    addPermission: jest.fn(),
    deletePermission: jest.fn(),
  };

  const mockRolesService: jest.Mocked<Pick<RolesService, 'findOne'>> = {
    findOne: jest.fn(),
  };

  const mockPermissionsService: jest.Mocked<Pick<PermissionsService, 'findOne'>> = {
    findOne: jest.fn(),
  };

  const mockAdminAuditLogWriter = {
    enqueue: jest.fn(),
  };

  const actorUserId = 'admin-actor-id';

  beforeEach(async () => {
    jest.clearAllMocks();
    mockRolesService.findOne.mockResolvedValue({ id: 'role-id' } as RoleResponseDto);
    mockPermissionsService.findOne.mockResolvedValue(
      new PermissionResponseDto({
        id: 'permission-id',
        key: 'users.read',
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolePermissionsService,
        { provide: RolePermissionsRepository, useValue: mockRolePermissionsRepository },
        { provide: RolesService, useValue: mockRolesService },
        { provide: PermissionsService, useValue: mockPermissionsService },
        { provide: AdminAuditLogWriterService, useValue: mockAdminAuditLogWriter },
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

      await service.addPermission('role-id', 'permission-id', actorUserId);

      expect(mockRolesService.findOne).toHaveBeenCalledWith('role-id');
      expect(mockPermissionsService.findOne).toHaveBeenCalledWith('permission-id');
      expect(mockRolePermissionsRepository.addPermission).toHaveBeenCalledWith({
        roleId: 'role-id',
        permissionId: 'permission-id',
      });
    });

    it('should not add permission when role does not exist', async () => {
      mockRolesService.findOne.mockRejectedValue(new NotFoundException());

      await expect(service.addPermission('missing', 'permission-id', actorUserId)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockPermissionsService.findOne).not.toHaveBeenCalled();
      expect(mockRolePermissionsRepository.addPermission).not.toHaveBeenCalled();
    });

    it('should reject reserved permission', async () => {
      mockPermissionsService.findOne.mockResolvedValue(
        new PermissionResponseDto({
          id: 'permission-id',
          key: MANAGE_ALL_PERMISSION_KEY,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      );

      await expect(service.addPermission('role-id', 'permission-id', actorUserId)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockRolePermissionsRepository.addPermission).not.toHaveBeenCalled();
    });

    it('should not add permission when permission does not exist', async () => {
      mockPermissionsService.findOne.mockRejectedValue(
        new NotFoundException('Permission not found'),
      );

      await expect(
        service.addPermission('role-id', 'missing-permission', actorUserId),
      ).rejects.toThrow(NotFoundException);
      expect(mockRolesService.findOne).toHaveBeenCalledWith('role-id');
      expect(mockPermissionsService.findOne).toHaveBeenCalledWith('missing-permission');
      expect(mockRolePermissionsRepository.addPermission).not.toHaveBeenCalled();
    });
  });

  describe('deletePermission', () => {
    it('should delete permission from role', async () => {
      mockRolePermissionsRepository.deletePermission.mockResolvedValue(undefined);

      await service.deletePermission('role-id', 'permission-id', actorUserId);

      expect(mockRolesService.findOne).toHaveBeenCalledWith('role-id');
      expect(mockPermissionsService.findOne).toHaveBeenCalledWith('permission-id');
      expect(mockRolePermissionsRepository.deletePermission).toHaveBeenCalledWith(
        'role-id',
        'permission-id',
      );
    });

    it('should not delete when role does not exist', async () => {
      mockRolesService.findOne.mockRejectedValue(new NotFoundException());

      await expect(
        service.deletePermission('missing', 'permission-id', actorUserId),
      ).rejects.toThrow(NotFoundException);
      expect(mockPermissionsService.findOne).not.toHaveBeenCalled();
      expect(mockRolePermissionsRepository.deletePermission).not.toHaveBeenCalled();
    });

    it('should reject removing reserved permission', async () => {
      mockPermissionsService.findOne.mockResolvedValue(
        new PermissionResponseDto({
          id: 'permission-id',
          key: MANAGE_ALL_PERMISSION_KEY,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      );

      await expect(
        service.deletePermission('role-id', 'permission-id', actorUserId),
      ).rejects.toThrow(BadRequestException);
      expect(mockRolePermissionsRepository.deletePermission).not.toHaveBeenCalled();
    });

    it('should not delete when permission does not exist', async () => {
      mockPermissionsService.findOne.mockRejectedValue(
        new NotFoundException('Permission not found'),
      );

      await expect(
        service.deletePermission('role-id', 'missing-permission', actorUserId),
      ).rejects.toThrow(NotFoundException);
      expect(mockRolesService.findOne).toHaveBeenCalledWith('role-id');
      expect(mockPermissionsService.findOne).toHaveBeenCalledWith('missing-permission');
      expect(mockRolePermissionsRepository.deletePermission).not.toHaveBeenCalled();
    });
  });
});
