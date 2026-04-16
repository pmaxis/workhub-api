import { Injectable, NotFoundException } from '@nestjs/common';
import { hashPassword } from '@/common/utils/hash.util';
import { AdminAuditLogLevel } from '@/infrastructure/database/generated/enums';
import { AdminAuditLogWriterService } from '@/modules/admin-audit-logs/service/admin-audit-log-writer.service';
import { UsersRepository } from '@/modules/users/repository/users.repository';
import { CreateUserDto } from '@/modules/users/dto/create-user.dto';
import { UpdateUserDto } from '@/modules/users/dto/update-user.dto';
import { UserResponseDto } from '@/modules/users/dto/user-response.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly adminAuditLogWriter: AdminAuditLogWriterService,
  ) {}

  async create(createUserDto: CreateUserDto, performedByUserId?: string): Promise<UserResponseDto> {
    const hashedPassword = await hashPassword(createUserDto.password);

    const user = await this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    this.adminAuditLogWriter.enqueue({
      level: AdminAuditLogLevel.INFO,
      source: 'users',
      message: performedByUserId ? 'User created by administrator' : 'User registered',
      actorUserId: performedByUserId,
      context: { newUserId: user.id, email: user.email },
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

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    actorUserId: string,
  ): Promise<UserResponseDto> {
    await this.findOne(id);

    const { password, ...rest } = updateUserDto;

    const hashedPassword = password ? await hashPassword(password) : undefined;

    const user = await this.usersRepository.update(id, {
      ...rest,
      password: hashedPassword,
    });

    this.adminAuditLogWriter.enqueue({
      level: AdminAuditLogLevel.INFO,
      source: 'users',
      message: 'User updated',
      actorUserId,
      context: { targetUserId: id, passwordChanged: Boolean(password) },
    });

    return new UserResponseDto(user);
  }

  async delete(id: string, actorUserId: string): Promise<void> {
    await this.findOne(id);

    await this.usersRepository.delete(id);

    this.adminAuditLogWriter.enqueue({
      level: AdminAuditLogLevel.INFO,
      source: 'users',
      message: 'User deleted',
      actorUserId,
      context: { deletedUserId: id },
    });
  }
}
