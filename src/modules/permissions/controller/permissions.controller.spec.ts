import { Test, TestingModule } from '@nestjs/testing';
import { PermissionsController } from '@/modules/permissions/controller/permissions.controller';
import { PermissionsService } from '@/modules/permissions/service/permissions.service';
import { CreatePermissionDto } from '@/modules/permissions/dto/create-permission.dto';
import { UpdatePermissionDto } from '@/modules/permissions/dto/update-permission.dto';
import { PermissionResponseDto } from '@/modules/permissions/dto/permission-response.dto';

describe('PermissionsController', () => {
  let controller: PermissionsController;

  const mockPermissionsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PermissionsController],
      providers: [
        {
          provide: PermissionsService,
          useValue: mockPermissionsService,
        },
      ],
    }).compile();

    controller = module.get<PermissionsController>(PermissionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a permission', async () => {
      const dto: CreatePermissionDto = { key: 'read:users', description: 'Read users' };
      const created = new PermissionResponseDto({
        id: 'permission-id',
        key: 'read:users',
        description: 'Read users',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockPermissionsService.create.mockResolvedValue(created);

      const result = await controller.create(dto);

      expect(mockPermissionsService.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(created);
    });
  });

  describe('findAll', () => {
    it('should return all permissions', async () => {
      const permissions = [
        new PermissionResponseDto({
          id: 'permission-id',
          key: 'read:users',
          description: 'Read users',
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      ];
      mockPermissionsService.findAll.mockResolvedValue(permissions);

      const result = await controller.findAll();

      expect(mockPermissionsService.findAll).toHaveBeenCalled();
      expect(result).toEqual(permissions);
    });
  });

  describe('findOne', () => {
    it('should return a permission by id', async () => {
      const permission = new PermissionResponseDto({
        id: 'permission-id',
        key: 'read:users',
        description: 'Read users',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockPermissionsService.findOne.mockResolvedValue(permission);

      const result = await controller.findOne('permission-id');

      expect(mockPermissionsService.findOne).toHaveBeenCalledWith('permission-id');
      expect(result).toEqual(permission);
    });
  });

  describe('update', () => {
    it('should update a permission', async () => {
      const dto: UpdatePermissionDto = { key: 'write:users', description: 'Write users' };
      const updated = new PermissionResponseDto({
        id: 'permission-id',
        key: 'write:users',
        description: 'Write users',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockPermissionsService.update.mockResolvedValue(updated);

      const result = await controller.update('permission-id', dto);

      expect(mockPermissionsService.update).toHaveBeenCalledWith('permission-id', dto);
      expect(result).toEqual(updated);
    });
  });

  describe('delete', () => {
    it('should delete a permission', async () => {
      mockPermissionsService.delete.mockResolvedValue(undefined);

      const result = await controller.delete('permission-id');

      expect(mockPermissionsService.delete).toHaveBeenCalledWith('permission-id');
      expect(result).toBeUndefined();
    });
  });
});
