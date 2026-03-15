import { Test, TestingModule } from '@nestjs/testing';
import { PermissionsService } from '@/modules/permissions/service/permissions.service';
import { PermissionsRepository } from '@/modules/permissions/repository/permissions.repository';
import { CreatePermissionDto } from '@/modules/permissions/dto/create-permission.dto';
import { UpdatePermissionDto } from '@/modules/permissions/dto/update-permission.dto';

const mockPermission = {
  id: 'permission-id',
  key: 'read:users',
  description: 'Read users',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('PermissionsService', () => {
  let service: PermissionsService;

  const mockPermissionsRepository = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    findByIdForCheck: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionsService,
        {
          provide: PermissionsRepository,
          useValue: mockPermissionsRepository,
        },
      ],
    }).compile();

    service = module.get<PermissionsService>(PermissionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a permission', async () => {
      const dto: CreatePermissionDto = { key: 'read:users', description: 'Read users' };
      mockPermissionsRepository.create.mockResolvedValue(mockPermission);

      const result = await service.create(dto);

      expect(mockPermissionsRepository.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockPermission);
    });
  });

  describe('findAll', () => {
    it('should return all permissions', async () => {
      const permissions = [mockPermission];
      mockPermissionsRepository.findAll.mockResolvedValue(permissions);

      const result = await service.findAll();

      expect(mockPermissionsRepository.findAll).toHaveBeenCalled();
      expect(result).toEqual(permissions);
    });
  });

  describe('findOne', () => {
    it('should return a permission by id', async () => {
      mockPermissionsRepository.findById.mockResolvedValue(mockPermission);

      const result = await service.findOne('permission-id');

      expect(mockPermissionsRepository.findById).toHaveBeenCalledWith('permission-id');
      expect(result).toEqual(mockPermission);
    });
  });

  describe('update', () => {
    it('should update a permission', async () => {
      const dto: UpdatePermissionDto = { key: 'write:users', description: 'Write users' };
      const updated = { ...mockPermission, ...dto };
      mockPermissionsRepository.findByIdForCheck.mockResolvedValue(mockPermission);
      mockPermissionsRepository.update.mockResolvedValue(updated);

      const result = await service.update('permission-id', dto);

      expect(mockPermissionsRepository.findByIdForCheck).toHaveBeenCalledWith('permission-id');
      expect(mockPermissionsRepository.update).toHaveBeenCalledWith('permission-id', dto);
      expect(result).toEqual(updated);
    });
  });

  describe('delete', () => {
    it('should delete a permission', async () => {
      mockPermissionsRepository.findByIdForCheck.mockResolvedValue(mockPermission);
      mockPermissionsRepository.delete.mockResolvedValue(undefined);

      await service.delete('permission-id');

      expect(mockPermissionsRepository.findByIdForCheck).toHaveBeenCalledWith('permission-id');
      expect(mockPermissionsRepository.delete).toHaveBeenCalledWith('permission-id');
    });
  });
});
