import { Injectable, NotFoundException } from '@nestjs/common';
import { hashPassword } from '@/common/utils/hash.util';
import { UsersRepository } from '@/modules/users/repository/users.repository';
import { CreateUserDto } from '@/modules/users/dto/create-user.dto';
import { UpdateUserDto } from '@/modules/users/dto/update-user.dto';
import { UserResponseDto } from '@/modules/users/dto/user-response.dto';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const hashedPassword = await hashPassword(createUserDto.password);

    const user = await this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    return new UserResponseDto(user);
  }

  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.usersRepository.findAll();
    return users.map((u) => new UserResponseDto(u));
  }

  async findOne(id: string): Promise<UserResponseDto> {
    const user = await this.usersRepository.findOne(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return new UserResponseDto(user);
  }

  async findForAuth(email: string) {
    return this.usersRepository.findOneByEmail(email);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    await this.findOne(id);

    const { password, ...rest } = updateUserDto;

    const hashedPassword = password ? await hashPassword(password) : undefined;

    const user = await this.usersRepository.update(id, {
      ...rest,
      password: hashedPassword,
    });

    return new UserResponseDto(user);
  }

  async delete(id: string): Promise<void> {
    await this.findOne(id);

    await this.usersRepository.delete(id);
  }
}
