import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PermissionsService } from '@/modules/permissions/service/permissions.service';
import { PermissionsRepository } from '@/modules/permissions/repository/permissions.repository';
import { CreatePermissionDto } from '@/modules/permissions/dto/create-permission.dto';
import { UpdatePermissionDto } from '@/modules/permissions/dto/update-permission.dto';
import { PermissionResponseDto } from '@/modules/permissions/dto/permission-response.dto';
import { MANAGE_ALL_PERMISSION_KEY } from '@/common/constants/reserved';

const mockPermissionFromRepo = {
  id: 'permission-id',
  key: 'read:users',
  description: 'Read users',
  createdAt: new Date('2020-01-01'),
  updatedAt: new Date('2020-01-01'),
};

describe('PermissionsService', () => {
  let service: PermissionsService;

  const mockPermissionsRepository = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
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
      mockPermissionsRepository.create.mockResolvedValue(mockPermissionFromRepo);

      const result = await service.create(dto);

      expect(mockPermissionsRepository.create).toHaveBeenCalledWith(dto);
      expect(result).toBeInstanceOf(PermissionResponseDto);
      expect(result).toMatchObject({
        id: 'permission-id',
        key: 'read:users',
        description: 'Read users',
      });
    });

    it('should reject reserved permission key', async () => {
      const dto: CreatePermissionDto = {
        key: MANAGE_ALL_PERMISSION_KEY,
        description: 'Reserved',
      };

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
      expect(mockPermissionsRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all permissions', async () => {
      const permissions = [mockPermissionFromRepo];
      mockPermissionsRepository.findAll.mockResolvedValue(permissions);

      const result = await service.findAll();

      expect(mockPermissionsRepository.findAll).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(PermissionResponseDto);
      expect(result[0]).toMatchObject({ id: 'permission-id', key: 'read:users' });
    });
  });

  describe('findOne', () => {
    it('should return a permission by id', async () => {
      mockPermissionsRepository.findOne.mockResolvedValue(mockPermissionFromRepo);

      const result = await service.findOne('permission-id');

      expect(mockPermissionsRepository.findOne).toHaveBeenCalledWith('permission-id');
      expect(result).toBeInstanceOf(PermissionResponseDto);
      expect(result).toMatchObject({ id: 'permission-id', key: 'read:users' });
    });

    it('should throw when permission not found', async () => {
      mockPermissionsRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('missing')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a permission', async () => {
      const dto: UpdatePermissionDto = { key: 'write:users', description: 'Write users' };
      const updated = { ...mockPermissionFromRepo, ...dto };
      mockPermissionsRepository.findOne.mockResolvedValue(mockPermissionFromRepo);
      mockPermissionsRepository.update.mockResolvedValue(updated);

      const result = await service.update('permission-id', dto);

      expect(mockPermissionsRepository.findOne).toHaveBeenCalledWith('permission-id');
      expect(mockPermissionsRepository.update).toHaveBeenCalledWith('permission-id', dto);
      expect(result).toBeInstanceOf(PermissionResponseDto);
      expect(result).toMatchObject({ key: 'write:users', description: 'Write users' });
    });

    it('should throw when permission not found', async () => {
      mockPermissionsRepository.findOne.mockResolvedValue(null);

      await expect(service.update('missing', { key: 'x', description: 'y' })).rejects.toThrow(
        NotFoundException,
      );
      expect(mockPermissionsRepository.update).not.toHaveBeenCalled();
    });

    it('should reject reserved key on update', async () => {
      mockPermissionsRepository.findOne.mockResolvedValue(mockPermissionFromRepo);

      await expect(
        service.update('permission-id', {
          key: MANAGE_ALL_PERMISSION_KEY,
          description: 'x',
        }),
      ).rejects.toThrow(BadRequestException);

      expect(mockPermissionsRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete a permission', async () => {
      mockPermissionsRepository.findOne.mockResolvedValue(mockPermissionFromRepo);
      mockPermissionsRepository.delete.mockResolvedValue(undefined);

      await service.delete('permission-id');

      expect(mockPermissionsRepository.findOne).toHaveBeenCalledWith('permission-id');
      expect(mockPermissionsRepository.delete).toHaveBeenCalledWith('permission-id');
    });

    it('should throw when permission not found', async () => {
      mockPermissionsRepository.findOne.mockResolvedValue(null);

      await expect(service.delete('missing')).rejects.toThrow(NotFoundException);
      expect(mockPermissionsRepository.delete).not.toHaveBeenCalled();
    });
  });
});
