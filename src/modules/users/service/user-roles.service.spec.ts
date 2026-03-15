import { Test, TestingModule } from '@nestjs/testing';
import { UserRolesService } from '@/modules/users/service/user-roles.service';
import { UserRolesRepository } from '@/modules/users/repository/user-roles.repository';
import { RolesRepository } from '@/modules/roles/repository/roles.repository';

describe('UserRolesService', () => {
  let service: UserRolesService;

  const mockUserRolesRepository = {
    addRole: jest.fn(),
    deleteRole: jest.fn(),
  };

  const mockRolesRepository = {
    findByIdForCheck: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    mockRolesRepository.findByIdForCheck.mockResolvedValue({ id: 'role-id', slug: 'editor' });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRolesService,
        { provide: UserRolesRepository, useValue: mockUserRolesRepository },
        { provide: RolesRepository, useValue: mockRolesRepository },
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

      expect(mockRolesRepository.findByIdForCheck).toHaveBeenCalledWith('role-id');
      expect(mockUserRolesRepository.addRole).toHaveBeenCalledWith({
        userId: 'user-id',
        roleId: 'role-id',
      });
    });
  });

  describe('deleteRole', () => {
    it('should delete role from user', async () => {
      mockUserRolesRepository.deleteRole.mockResolvedValue(undefined);

      await service.deleteRole('user-id', 'role-id');

      expect(mockRolesRepository.findByIdForCheck).toHaveBeenCalledWith('role-id');
      expect(mockUserRolesRepository.deleteRole).toHaveBeenCalledWith('user-id', 'role-id');
    });
  });
});
