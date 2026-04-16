import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AdminAuditLogWriterService } from '@/modules/admin-audit-logs/service/admin-audit-log-writer.service';
import { RolesService } from '@/modules/roles/service/roles.service';
import { RolesRepository } from '@/modules/roles/repository/roles.repository';
import { CreateRoleDto } from '@/modules/roles/dto/create-role.dto';
import { UpdateRoleDto } from '@/modules/roles/dto/update-role.dto';
import { RoleResponseDto } from '@/modules/roles/dto/role-response.dto';
import { ADMIN_ROLE_SLUG } from '@/common/constants/reserved';

const mockRoleFromRepo = {
  id: 'role-id',
  slug: 'editor',
  name: 'Editor',
  permissions: [],
  createdAt: new Date('2020-01-01'),
  updatedAt: new Date('2020-01-01'),
};

describe('RolesService', () => {
  let service: RolesService;

  const mockRolesRepository = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockAdminAuditLogWriter = {
    enqueue: jest.fn(),
  };

  const actorUserId = 'admin-actor-id';

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesService,
        {
          provide: RolesRepository,
          useValue: mockRolesRepository,
        },
        { provide: AdminAuditLogWriterService, useValue: mockAdminAuditLogWriter },
      ],
    }).compile();

    service = module.get<RolesService>(RolesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a role', async () => {
      const dto: CreateRoleDto = { slug: 'editor', name: 'Editor' };
      mockRolesRepository.create.mockResolvedValue(mockRoleFromRepo);

      const result = await service.create(dto, actorUserId);

      expect(mockRolesRepository.create).toHaveBeenCalledWith(dto);
      expect(result).toBeInstanceOf(RoleResponseDto);
      expect(result).toMatchObject({ id: 'role-id', slug: 'editor', name: 'Editor' });
    });

    it('should reject reserved admin slug', async () => {
      const dto: CreateRoleDto = { slug: ADMIN_ROLE_SLUG, name: 'Admin' };

      await expect(service.create(dto, actorUserId)).rejects.toThrow(BadRequestException);
      expect(mockRolesRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all roles', async () => {
      const roles = [mockRoleFromRepo];
      mockRolesRepository.findAll.mockResolvedValue(roles);

      const result = await service.findAll();

      expect(mockRolesRepository.findAll).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(RoleResponseDto);
      expect(result[0]).toMatchObject({ id: 'role-id', slug: 'editor' });
    });
  });

  describe('findOne', () => {
    it('should return a role by id', async () => {
      mockRolesRepository.findOne.mockResolvedValue(mockRoleFromRepo);

      const result = await service.findOne('role-id');

      expect(mockRolesRepository.findOne).toHaveBeenCalledWith('role-id');
      expect(result).toBeInstanceOf(RoleResponseDto);
      expect(result).toMatchObject({ id: 'role-id', slug: 'editor' });
    });

    it('should throw when role not found', async () => {
      mockRolesRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('missing')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a role', async () => {
      const dto: UpdateRoleDto = { slug: 'manager', name: 'Manager' };
      const updated = { ...mockRoleFromRepo, ...dto };
      mockRolesRepository.findOne.mockResolvedValue(mockRoleFromRepo);
      mockRolesRepository.update.mockResolvedValue(updated);

      const result = await service.update('role-id', dto, actorUserId);

      expect(mockRolesRepository.findOne).toHaveBeenCalledWith('role-id');
      expect(mockRolesRepository.update).toHaveBeenCalledWith('role-id', dto);
      expect(result).toBeInstanceOf(RoleResponseDto);
      expect(result).toMatchObject({ slug: 'manager', name: 'Manager' });
    });

    it('should throw when role not found', async () => {
      mockRolesRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update('missing', { slug: 'x', name: 'y' }, actorUserId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should reject reserved slug on update', async () => {
      mockRolesRepository.findOne.mockResolvedValue(mockRoleFromRepo);

      await expect(
        service.update('role-id', { slug: ADMIN_ROLE_SLUG, name: 'Renamed' }, actorUserId),
      ).rejects.toThrow(BadRequestException);

      expect(mockRolesRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete a role', async () => {
      mockRolesRepository.findOne.mockResolvedValue(mockRoleFromRepo);
      mockRolesRepository.delete.mockResolvedValue(undefined);

      await service.delete('role-id', actorUserId);

      expect(mockRolesRepository.findOne).toHaveBeenCalledWith('role-id');
      expect(mockRolesRepository.delete).toHaveBeenCalledWith('role-id');
    });

    it('should throw when role not found', async () => {
      mockRolesRepository.findOne.mockResolvedValue(null);

      await expect(service.delete('missing', actorUserId)).rejects.toThrow(NotFoundException);
    });
  });
});
