import { Test, TestingModule } from '@nestjs/testing';
import { RolesController } from '@/modules/roles/controller/roles.controller';
import { RolesService } from '@/modules/roles/service/roles.service';
import { CreateRoleDto } from '@/modules/roles/dto/create-role.dto';
import { UpdateRoleDto } from '@/modules/roles/dto/update-role.dto';

const mockRole = {
  id: 'role-id',
  slug: 'admin',
  name: 'Administrator',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('RolesController', () => {
  let controller: RolesController;

  const mockRolesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RolesController],
      providers: [
        {
          provide: RolesService,
          useValue: mockRolesService,
        },
      ],
    }).compile();

    controller = module.get<RolesController>(RolesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a role', async () => {
      const dto: CreateRoleDto = { slug: 'admin', name: 'Administrator' };
      mockRolesService.create.mockResolvedValue(mockRole);

      const result = await controller.create(dto);

      expect(mockRolesService.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockRole);
    });
  });

  describe('findAll', () => {
    it('should return all roles', async () => {
      const roles = [mockRole];
      mockRolesService.findAll.mockResolvedValue(roles);

      const result = await controller.findAll();

      expect(mockRolesService.findAll).toHaveBeenCalled();
      expect(result).toEqual(roles);
    });
  });

  describe('findOne', () => {
    it('should return a role by id', async () => {
      mockRolesService.findOne.mockResolvedValue(mockRole);

      const result = await controller.findOne('role-id');

      expect(mockRolesService.findOne).toHaveBeenCalledWith('role-id');
      expect(result).toEqual(mockRole);
    });
  });

  describe('update', () => {
    it('should update a role', async () => {
      const dto: UpdateRoleDto = { slug: 'editor', name: 'Editor' };
      const updated = { ...mockRole, ...dto };
      mockRolesService.update.mockResolvedValue(updated);

      const result = await controller.update('role-id', dto);

      expect(mockRolesService.update).toHaveBeenCalledWith('role-id', dto);
      expect(result).toEqual(updated);
    });
  });

  describe('delete', () => {
    it('should delete a role', async () => {
      mockRolesService.delete.mockResolvedValue(undefined);

      const result = await controller.delete('role-id');

      expect(mockRolesService.delete).toHaveBeenCalledWith('role-id');
      expect(result).toBeUndefined();
    });
  });
});
