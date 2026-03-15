import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ProfileService } from '@/modules/profile/service/profile.service';
import { ProfileRepository } from '@/modules/profile/repository/profile.repository';
import { UpdateProfileDto } from '@/modules/profile/dto/update-profile.dto';

jest.mock('@/common/utils/hash.util', () => ({
  hashPassword: jest.fn().mockResolvedValue('hashed-password'),
}));

const mockUser = {
  id: 'user-1',
  email: 'user@example.com',
  firstName: 'John',
  lastName: 'Doe',
  thirdName: null,
  roles: [{ role: { id: 'role-1', slug: 'editor', name: 'Editor' } }],
};

const mockProfileRepository = {
  findById: jest.fn(),
  update: jest.fn(),
};

describe('ProfileService', () => {
  let service: ProfileService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProfileService, { provide: ProfileRepository, useValue: mockProfileRepository }],
    }).compile();

    service = module.get<ProfileService>(ProfileService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getProfile', () => {
    it('should return user profile by id', async () => {
      mockProfileRepository.findById.mockResolvedValue(mockUser);

      const result = await service.getProfile('user-1');

      expect(mockProfileRepository.findById).toHaveBeenCalledWith('user-1');
      expect(result).toBeDefined();
      expect(result?.id).toBe('user-1');
      expect(result?.email).toBe('user@example.com');
    });

    it('should return null when user not found', async () => {
      mockProfileRepository.findById.mockResolvedValue(null);

      const result = await service.getProfile('unknown');

      expect(mockProfileRepository.findById).toHaveBeenCalledWith('unknown');
      expect(result).toBeNull();
    });
  });

  describe('updateProfile', () => {
    it('should update profile without password', async () => {
      const dto: UpdateProfileDto = { firstName: 'Jane', lastName: 'Smith' };
      const updated = { ...mockUser, ...dto };
      mockProfileRepository.findById.mockResolvedValue(mockUser);
      mockProfileRepository.update.mockResolvedValue(updated);

      const result = await service.updateProfile('user-1', dto);

      expect(mockProfileRepository.findById).toHaveBeenCalledWith('user-1');
      expect(mockProfileRepository.update).toHaveBeenCalledWith('user-1', {
        ...dto,
        password: undefined,
      });
      expect(result.firstName).toBe('Jane');
      expect(result.lastName).toBe('Smith');
    });

    it('should hash and update when password provided', async () => {
      const dto: UpdateProfileDto = { password: 'newpassword' };
      mockProfileRepository.findById.mockResolvedValue(mockUser);
      mockProfileRepository.update.mockResolvedValue(mockUser);

      await service.updateProfile('user-1', dto);

      expect(mockProfileRepository.update).toHaveBeenCalledWith('user-1', {
        password: 'hashed-password',
      });
    });

    it('should throw NotFoundException when user not found', async () => {
      mockProfileRepository.findById.mockResolvedValue(null);

      await expect(service.updateProfile('unknown', { firstName: 'Jane' })).rejects.toThrow(
        NotFoundException,
      );
      expect(mockProfileRepository.update).not.toHaveBeenCalled();
    });
  });
});
