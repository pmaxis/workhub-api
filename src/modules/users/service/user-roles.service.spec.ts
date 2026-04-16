import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AdminAuditLogWriterService } from '@/modules/admin-audit-logs/service/admin-audit-log-writer.service';
import { UserRolesService } from '@/modules/users/service/user-roles.service';
import { UserRolesRepository } from '@/modules/users/repository/user-roles.repository';
import { UsersService } from '@/modules/users/service/users.service';
import { RolesService } from '@/modules/roles/service/roles.service';
import { UserResponseDto } from '@/modules/users/dto/user-response.dto';
import { RoleResponseDto } from '@/modules/roles/dto/role-response.dto';
import { ADMIN_ROLE_SLUG } from '@/common/constants/reserved';

describe('UserRolesService', () => {
  let service: UserRolesService;

  const mockUserRolesRepository = {
    addRole: jest.fn(),
    deleteRole: jest.fn(),
  };

  const mockUsersService: jest.Mocked<Pick<UsersService, 'findOne'>> = {
    findOne: jest.fn(),
  };

  const mockRolesService: jest.Mocked<Pick<RolesService, 'findOne'>> = {
    findOne: jest.fn(),
  };

  const mockAdminAuditLogWriter = {
    enqueue: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    mockUsersService.findOne.mockResolvedValue({ id: 'user-id' } as UserResponseDto);
    mockRolesService.findOne.mockResolvedValue({
      id: 'role-id',
      slug: 'editor',
    } as RoleResponseDto);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRolesService,
        { provide: UserRolesRepository, useValue: mockUserRolesRepository },
        { provide: UsersService, useValue: mockUsersService },
        { provide: RolesService, useValue: mockRolesService },
        { provide: AdminAuditLogWriterService, useValue: mockAdminAuditLogWriter },
      ],
    }).compile();

    service = module.get<UserRolesService>(UserRolesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addRole', () => {
    it('should add role to user', async () => {
      mockUserRolesRepository.addRole.mockResolvedValue(undefined);

      await service.addRole('user-id', 'role-id');

      expect(mockUsersService.findOne).toHaveBeenCalledWith('user-id');
      expect(mockRolesService.findOne).toHaveBeenCalledWith('role-id');
      expect(mockUserRolesRepository.addRole).toHaveBeenCalledWith({
        userId: 'user-id',
        roleId: 'role-id',
      });
    });

    it('should not add role when user does not exist', async () => {
      mockUsersService.findOne.mockRejectedValue(new NotFoundException());

      await expect(service.addRole('missing', 'role-id')).rejects.toThrow(NotFoundException);
      expect(mockRolesService.findOne).not.toHaveBeenCalled();
      expect(mockUserRolesRepository.addRole).not.toHaveBeenCalled();
    });

    it('should reject reserved admin role', async () => {
      mockRolesService.findOne.mockResolvedValue({
        id: 'role-id',
        slug: ADMIN_ROLE_SLUG,
      } as RoleResponseDto);

      await expect(service.addRole('user-id', 'role-id')).rejects.toThrow(BadRequestException);
      expect(mockUserRolesRepository.addRole).not.toHaveBeenCalled();
    });
  });

  describe('deleteRole', () => {
    it('should delete role from user', async () => {
      mockUserRolesRepository.deleteRole.mockResolvedValue(undefined);

      await service.deleteRole('user-id', 'role-id');

      expect(mockUsersService.findOne).toHaveBeenCalledWith('user-id');
      expect(mockRolesService.findOne).toHaveBeenCalledWith('role-id');
      expect(mockUserRolesRepository.deleteRole).toHaveBeenCalledWith('user-id', 'role-id');
    });

    it('should reject removing reserved admin role', async () => {
      mockRolesService.findOne.mockResolvedValue({
        id: 'role-id',
        slug: ADMIN_ROLE_SLUG,
      } as RoleResponseDto);

      await expect(service.deleteRole('user-id', 'role-id')).rejects.toThrow(BadRequestException);
      expect(mockUserRolesRepository.deleteRole).not.toHaveBeenCalled();
    });
  });
});
