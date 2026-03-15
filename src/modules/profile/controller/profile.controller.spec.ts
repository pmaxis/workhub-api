import { Test, TestingModule } from '@nestjs/testing';
import { ProfileController } from '@/modules/profile/controller/profile.controller';
import { ProfileService } from '@/modules/profile/service/profile.service';
import { UpdateProfileDto } from '@/modules/profile/dto/update-profile.dto';

const mockProfileService = {
  getProfile: jest.fn(),
  updateProfile: jest.fn(),
};

describe('ProfileController', () => {
  let controller: ProfileController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfileController],
      providers: [{ provide: ProfileService, useValue: mockProfileService }],
    }).compile();

    controller = module.get<ProfileController>(ProfileController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getProfile', () => {
    it('should return current user profile', async () => {
      const user = {
        id: 'user-1',
        email: 'user@example.com',
        firstName: 'John',
        lastName: 'Doe',
        roles: [],
      };
      mockProfileService.getProfile.mockResolvedValue(user);

      const result = await controller.getProfile('user-1');

      expect(result).toEqual(user);
      expect(mockProfileService.getProfile).toHaveBeenCalledWith('user-1');
    });

    it('should return null when user not found', async () => {
      mockProfileService.getProfile.mockResolvedValue(null);

      const result = await controller.getProfile('user-1');

      expect(result).toBeNull();
      expect(mockProfileService.getProfile).toHaveBeenCalledWith('user-1');
    });
  });

  describe('updateProfile', () => {
    it('should update profile and return result', async () => {
      const dto: UpdateProfileDto = { firstName: 'Jane', lastName: 'Smith' };
      const updated = {
        id: 'user-1',
        email: 'user@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        roles: [],
      };
      mockProfileService.updateProfile.mockResolvedValue(updated);

      const result = await controller.updateProfile('user-1', dto);

      expect(result).toEqual(updated);
      expect(mockProfileService.updateProfile).toHaveBeenCalledWith('user-1', dto);
    });
  });
});
