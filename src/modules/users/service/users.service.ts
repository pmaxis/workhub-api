import { Injectable } from '@nestjs/common';
import { UsersRepository } from '@/modules/users/repository/users.repository';
import { CreateUserDto } from '@/modules/users/dto/create-user.dto';
import { UpdateUserDto } from '@/modules/users/dto/update-user.dto';
import { hashPassword } from '@/common/utils/hash.util';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async create(createUserDto: CreateUserDto) {
    const hashedPassword = await hashPassword(createUserDto.password);
    const user = await this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });
    return user;
  }

  findAll() {
    return this.usersRepository.findAll();
  }

  findOne(id: string) {
    return this.usersRepository.findOne(id);
  }

  findOneByEmail(email: string) {
    return this.usersRepository.findOneByEmail(email);
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const { password, ...rest } = updateUserDto;
    const hashedPassword = password ? await hashPassword(password) : undefined;
    const user = await this.usersRepository.update(id, { ...rest, password: hashedPassword });
    return user;
  }

  delete(id: string) {
    return this.usersRepository.delete(id);
  }
}
