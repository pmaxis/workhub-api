import { Injectable, NotFoundException } from '@nestjs/common';
import { hashPassword } from '@/common/utils/hash.util';
import { UsersRepository } from '@/modules/users/repository/users.repository';
import { CreateUserDto } from '@/modules/users/dto/create-user.dto';
import { UpdateUserDto } from '@/modules/users/dto/update-user.dto';
import { UserResponseDto } from '@/modules/users/dto/user-response.dto';
import { RoleResponseDto } from '@/modules/roles/dto/role-response.dto';

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
    return users.map(
      (user) =>
        new UserResponseDto({
          ...user,
          roles: user.roles.map((ur) => new RoleResponseDto(ur.role)),
        }),
    );
  }

  async findOne(id: string): Promise<UserResponseDto | null> {
    const user = await this.usersRepository.findOne(id);
    if (!user) return null;
    return new UserResponseDto({
      ...user,
      roles: user.roles.map((ur) => new RoleResponseDto(ur.role)),
    });
  }

  /** Returns user with password hash for auth flow only. Do not use for general queries. */
  async findForAuth(email: string) {
    return this.usersRepository.findOneByEmail(email);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    const existing = await this.findOne(id);
    if (!existing) throw new NotFoundException('User not found');
    const { password, ...rest } = updateUserDto;
    const hashedPassword = password ? await hashPassword(password) : undefined;
    const user = await this.usersRepository.update(id, { ...rest, password: hashedPassword });
    return new UserResponseDto({
      ...user,
      roles: user.roles.map((ur) => new RoleResponseDto(ur.role)),
    });
  }

  async delete(id: string): Promise<void> {
    const existing = await this.findOne(id);
    if (!existing) throw new NotFoundException('User not found');
    await this.usersRepository.delete(id);
  }
}
