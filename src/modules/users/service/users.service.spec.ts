import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '@/modules/users/service/users.service';
import { UsersRepository } from '@/modules/users/repository/users.repository';
import { CreateUserDto } from '@/modules/users/dto/create-user.dto';
import { UpdateUserDto } from '@/modules/users/dto/update-user.dto';

jest.mock('@/common/utils/hash.util', () => ({
  hashPassword: jest.fn().mockResolvedValue('hashed-password'),
}));

const mockUsersRepository = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  findOneByEmail: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, { provide: UsersRepository, useValue: mockUsersRepository }],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should hash password and create user', async () => {
      const dto: CreateUserDto = {
        email: 'user@example.com',
        password: 'plain',
        firstName: 'John',
        lastName: 'Doe',
      };
      const created = { id: '1', ...dto, password: 'hashed-password' };
      mockUsersRepository.create.mockResolvedValue(created);

      const result = await service.create(dto);

      expect(result).toEqual(created);
      expect(mockUsersRepository.create).toHaveBeenCalledWith({
        ...dto,
        password: 'hashed-password',
      });
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const users = [{ id: '1', email: 'a@b.com', roles: [] }];
      mockUsersRepository.findAll.mockResolvedValue(users);

      const result = await service.findAll();

      expect(result).toEqual(users);
      expect(mockUsersRepository.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return user by id', async () => {
      const user = { id: '1', email: 'a@b.com', roles: [] };
      mockUsersRepository.findOne.mockResolvedValue(user);

      const result = await service.findOne('1');

      expect(result).toEqual(user);
      expect(mockUsersRepository.findOne).toHaveBeenCalledWith('1');
    });
  });

  describe('findForAuth', () => {
    it('should return user by email for auth', async () => {
      const user = { id: '1', email: 'a@b.com', password: 'hash' };
      mockUsersRepository.findOneByEmail.mockResolvedValue(user);

      const result = await service.findForAuth('a@b.com');

      expect(result).toEqual(user);
      expect(mockUsersRepository.findOneByEmail).toHaveBeenCalledWith('a@b.com');
    });
  });

  describe('update', () => {
    it('should update user without password', async () => {
      const dto: UpdateUserDto = { firstName: 'Jane' };
      const updated = { id: '1', firstName: 'Jane', roles: [] };
      mockUsersRepository.update.mockResolvedValue(updated);

      const result = await service.update('1', dto);

      expect(result).toEqual(updated);
      expect(mockUsersRepository.update).toHaveBeenCalledWith('1', {
        ...dto,
        password: undefined,
      });
    });

    it('should hash and update when password provided', async () => {
      const dto: UpdateUserDto = { password: 'newpass' };
      mockUsersRepository.update.mockResolvedValue({ id: '1', roles: [] });

      await service.update('1', dto);

      expect(mockUsersRepository.update).toHaveBeenCalledWith('1', {
        password: 'hashed-password',
      });
    });
  });

  describe('delete', () => {
    it('should delete user by id', async () => {
      mockUsersRepository.delete.mockResolvedValue(undefined);

      await service.delete('1');

      expect(mockUsersRepository.delete).toHaveBeenCalledWith('1');
    });
  });
});
