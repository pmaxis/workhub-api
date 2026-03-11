import { Test, TestingModule } from '@nestjs/testing';
import { UserRolesService } from '@/modules/users/service/user-roles.service';
import { UserRolesRepository } from '@/modules/users/repository/user-roles.repository';

const mockUserRole = {
  userId: 'user-id',
  roleId: 'role-id',
};

describe('UserRolesService', () => {
  let service: UserRolesService;

  const mockUserRolesRepository = {
    addRole: jest.fn(),
    deleteRole: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRolesService,
        {
          provide: UserRolesRepository,
          useValue: mockUserRolesRepository,
        },
      ],
    }).compile();

    service = module.get<UserRolesService>(UserRolesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addRole', () => {
    it('should add role to user', async () => {
      mockUserRolesRepository.addRole.mockResolvedValue(mockUserRole);

      const result = await service.addRole('user-id', 'role-id');

      expect(mockUserRolesRepository.addRole).toHaveBeenCalledWith({
        userId: 'user-id',
        roleId: 'role-id',
      });
      expect(result).toEqual(mockUserRole);
    });
  });

  describe('deleteRole', () => {
    it('should delete role from user', async () => {
      mockUserRolesRepository.deleteRole.mockResolvedValue(mockUserRole);

      const result = await service.deleteRole('user-id', 'role-id');

      expect(mockUserRolesRepository.deleteRole).toHaveBeenCalledWith('user-id', 'role-id');
      expect(result).toEqual(mockUserRole);
    });
  });
});
