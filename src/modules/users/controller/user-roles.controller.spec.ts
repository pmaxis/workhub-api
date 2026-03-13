import { Test, TestingModule } from '@nestjs/testing';
import { UserRolesController } from '@/modules/users/controller/user-roles.controller';
import { UserRolesService } from '@/modules/users/service/user-roles.service';

describe('UserRolesController', () => {
  let controller: UserRolesController;

  const mockUserRolesService = {
    addRole: jest.fn(),
    deleteRole: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserRolesController],
      providers: [
        {
          provide: UserRolesService,
          useValue: mockUserRolesService,
        },
      ],
    }).compile();

    controller = module.get<UserRolesController>(UserRolesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('addRole', () => {
    it('should add role to user', async () => {
      mockUserRolesService.addRole.mockResolvedValue(undefined);

      await controller.addRole('user-id', { roleId: 'role-id' });

      expect(mockUserRolesService.addRole).toHaveBeenCalledWith('user-id', 'role-id');
    });
  });

  describe('deleteRole', () => {
    it('should delete role from user', async () => {
      mockUserRolesService.deleteRole.mockResolvedValue(undefined);

      await controller.deleteRole('user-id', 'role-id');

      expect(mockUserRolesService.deleteRole).toHaveBeenCalledWith('user-id', 'role-id');
    });
  });
});
