import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from '@/modules/users/service/users.service';
import { UsersRepository } from '@/modules/users/repository/users.repository';
import { CreateUserDto } from '@/modules/users/dto/create-user.dto';
import { UpdateUserDto } from '@/modules/users/dto/update-user.dto';
import { UserResponseDto } from '@/modules/users/dto/user-response.dto';

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

const baseUser = {
  id: '1',
  email: 'a@b.com',
  firstName: 'John',
  lastName: 'Doe',
  thirdName: null as string | null,
  roles: [] as [],
  createdAt: new Date('2020-01-01'),
  updatedAt: new Date('2020-01-01'),
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
      const created = {
        ...baseUser,
        id: '1',
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        password: 'hashed-password',
      };
      mockUsersRepository.create.mockResolvedValue(created);

      const result = await service.create(dto);

      expect(result).toBeInstanceOf(UserResponseDto);
      expect(result).toMatchObject({
        id: '1',
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
      });
      expect(mockUsersRepository.create).toHaveBeenCalledWith({
        ...dto,
        password: 'hashed-password',
      });
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const users = [{ ...baseUser, id: '1', email: 'a@b.com' }];
      mockUsersRepository.findAll.mockResolvedValue(users);

      const result = await service.findAll();

      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(UserResponseDto);
      expect(result[0]).toMatchObject({ id: '1', email: 'a@b.com' });
      expect(mockUsersRepository.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return user by id', async () => {
      const user = { ...baseUser, id: '1', email: 'a@b.com' };
      mockUsersRepository.findOne.mockResolvedValue(user);

      const result = await service.findOne('1');

      expect(result).toBeInstanceOf(UserResponseDto);
      expect(result).toMatchObject({ id: '1', email: 'a@b.com' });
      expect(mockUsersRepository.findOne).toHaveBeenCalledWith('1');
    });

    it('should throw when user not found', async () => {
      mockUsersRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('missing')).rejects.toThrow(NotFoundException);
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
    beforeEach(() => {
      mockUsersRepository.findOne.mockResolvedValue({ ...baseUser, id: '1' });
    });

    it('should update user without password', async () => {
      const dto: UpdateUserDto = { firstName: 'Jane' };
      const updated = { ...baseUser, id: '1', firstName: 'Jane' };
      mockUsersRepository.update.mockResolvedValue(updated);

      const result = await service.update('1', dto);

      expect(result).toBeInstanceOf(UserResponseDto);
      expect(result).toMatchObject({ id: '1', firstName: 'Jane' });
      expect(mockUsersRepository.findOne).toHaveBeenCalledWith('1');
      expect(mockUsersRepository.update).toHaveBeenCalledWith('1', {
        firstName: 'Jane',
        password: undefined,
      });
    });

    it('should hash and update when password provided', async () => {
      const dto: UpdateUserDto = { password: 'newpass' };
      mockUsersRepository.update.mockResolvedValue({ ...baseUser, id: '1' });

      await service.update('1', dto);

      expect(mockUsersRepository.update).toHaveBeenCalledWith('1', {
        password: 'hashed-password',
      });
    });

    it('should throw when user not found', async () => {
      mockUsersRepository.findOne.mockResolvedValue(null);

      await expect(service.update('1', {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete user by id', async () => {
      mockUsersRepository.findOne.mockResolvedValue({ ...baseUser, id: '1' });
      mockUsersRepository.delete.mockResolvedValue(undefined);

      await service.delete('1');

      expect(mockUsersRepository.findOne).toHaveBeenCalledWith('1');
      expect(mockUsersRepository.delete).toHaveBeenCalledWith('1');
    });

    it('should throw when user not found', async () => {
      mockUsersRepository.findOne.mockResolvedValue(null);

      await expect(service.delete('1')).rejects.toThrow(NotFoundException);
    });
  });
});
