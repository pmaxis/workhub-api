import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from '@/modules/users/controller/users.controller';
import { UsersService } from '@/modules/users/service/users.service';
import { CreateUserDto } from '@/modules/users/dto/create-user.dto';
import { UpdateUserDto } from '@/modules/users/dto/update-user.dto';

const mockUsersService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: mockUsersService }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create user and return result', async () => {
      const dto: CreateUserDto = {
        email: 'u@example.com',
        password: 'pass',
        firstName: 'John',
        lastName: 'Doe',
      };
      const created = { id: '1', ...dto };
      mockUsersService.create.mockResolvedValue(created);

      const result = await controller.create(dto);

      expect(result).toEqual(created);
      expect(mockUsersService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should return list of users', async () => {
      const users = [{ id: '1', email: 'a@b.com' }];
      mockUsersService.findAll.mockResolvedValue(users);

      const result = await controller.findAll();

      expect(result).toEqual(users);
      expect(mockUsersService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return user by id', async () => {
      const user = { id: '1', email: 'a@b.com' };
      mockUsersService.findOne.mockResolvedValue(user);

      const result = await controller.findOne('1');

      expect(result).toEqual(user);
      expect(mockUsersService.findOne).toHaveBeenCalledWith('1');
    });
  });

  describe('update', () => {
    it('should update user and return result', async () => {
      const dto: UpdateUserDto = { firstName: 'Jane' };
      const updated = { id: '1', firstName: 'Jane' };
      mockUsersService.update.mockResolvedValue(updated);

      const result = await controller.update('1', dto);

      expect(result).toEqual(updated);
      expect(mockUsersService.update).toHaveBeenCalledWith('1', dto);
    });
  });

  describe('delete', () => {
    it('should delete user by id', async () => {
      mockUsersService.delete.mockResolvedValue(undefined);

      const result = await controller.delete('1');

      expect(result).toBeUndefined();
      expect(mockUsersService.delete).toHaveBeenCalledWith('1');
    });
  });
});
