import { Test, TestingModule } from '@nestjs/testing';
import { RolesService } from '@/modules/roles/service/roles.service';
import { RolesRepository } from '@/modules/roles/repository/roles.repository';
import { CreateRoleDto } from '@/modules/roles/dto/create-role.dto';
import { UpdateRoleDto } from '@/modules/roles/dto/update-role.dto';

const mockRole = {
  id: 'role-id',
  slug: 'admin',
  name: 'Administrator',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('RolesService', () => {
  let service: RolesService;

  const mockRolesRepository = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesService,
        {
          provide: RolesRepository,
          useValue: mockRolesRepository,
        },
      ],
    }).compile();

    service = module.get<RolesService>(RolesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a role', async () => {
      const dto: CreateRoleDto = { slug: 'admin', name: 'Administrator' };
      mockRolesRepository.create.mockResolvedValue(mockRole);

      const result = await service.create(dto);

      expect(mockRolesRepository.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockRole);
    });
  });

  describe('findAll', () => {
    it('should return all roles', async () => {
      const roles = [mockRole];
      mockRolesRepository.findAll.mockResolvedValue(roles);

      const result = await service.findAll();

      expect(mockRolesRepository.findAll).toHaveBeenCalled();
      expect(result).toEqual(roles);
    });
  });

  describe('findOne', () => {
    it('should return a role by id', async () => {
      mockRolesRepository.findById.mockResolvedValue(mockRole);

      const result = await service.findOne('role-id');

      expect(mockRolesRepository.findById).toHaveBeenCalledWith('role-id');
      expect(result).toEqual(mockRole);
    });
  });

  describe('update', () => {
    it('should update a role', async () => {
      const dto: UpdateRoleDto = { slug: 'editor', name: 'Editor' };
      const updated = { ...mockRole, ...dto };
      mockRolesRepository.update.mockResolvedValue(updated);

      const result = await service.update('role-id', dto);

      expect(mockRolesRepository.update).toHaveBeenCalledWith('role-id', dto);
      expect(result).toEqual(updated);
    });
  });

  describe('delete', () => {
    it('should delete a role', async () => {
      mockRolesRepository.delete.mockResolvedValue(mockRole);

      const result = await service.delete('role-id');

      expect(mockRolesRepository.delete).toHaveBeenCalledWith('role-id');
      expect(result).toEqual(mockRole);
    });
  });
});
