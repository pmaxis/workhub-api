import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { subject } from '@casl/ability';
import { Prisma } from '@/infrastructure/database/generated/client';
import { AppAbility, Action } from '@/common/ability/ability.types';
import { ProjectsRepository } from '@/modules/projects/repository/projects.repository';
import { CreateExpenseDto } from '@/modules/expenses/dto/create-expense.dto';
import { UpdateExpenseDto } from '@/modules/expenses/dto/update-expense.dto';
import { ExpenseResponseDto } from '@/modules/expenses/dto/expense-response.dto';
import { PaginatedExpensesResponseDto } from '@/modules/expenses/dto/paginated-expenses-response.dto';
import { ExpensesRepository } from '@/modules/expenses/repository/expenses.repository';

@Injectable()
export class ExpensesService {
  constructor(
    private readonly expensesRepository: ExpensesRepository,
    private readonly projectsRepository: ProjectsRepository,
  ) {}

  async create(
    userId: string,
    ability: AppAbility,
    dto: CreateExpenseDto,
  ): Promise<ExpenseResponseDto> {
    let projectId: string | null = null;
    if (dto.projectId) {
      const project = await this.projectsRepository.findOne(dto.projectId, ability);
      if (!project) {
        throw new NotFoundException('Project not found');
      }
      projectId = project.id;
    }

    const row = await this.expensesRepository.create({
      userId,
      projectId,
      description: dto.description.trim(),
      category: dto.category?.trim() ? dto.category.trim() : null,
      amount: new Prisma.Decimal(dto.amount),
      currency: (dto.currency ?? 'USD').toUpperCase(),
      spentAt: new Date(dto.spentAt),
      notes: dto.notes?.trim() ? dto.notes.trim() : null,
    });
    return new ExpenseResponseDto(row);
  }

  async findAll(
    ability: AppAbility,
    query: {
      projectId?: string;
      category?: string;
      from?: string;
      to?: string;
      page?: number;
      limit?: number;
    },
  ): Promise<PaginatedExpensesResponseDto> {
    const result = await this.expensesRepository.findAll({
      ability,
      projectId: query.projectId,
      category: query.category,
      from: query.from ? new Date(query.from) : undefined,
      to: query.to ? new Date(query.to) : undefined,
      page: query.page ?? 1,
      limit: query.limit ?? 20,
    });
    return {
      ...result,
      data: result.data.map((r) => new ExpenseResponseDto(r)),
    };
  }

  async findOne(id: string, ability: AppAbility): Promise<ExpenseResponseDto> {
    const row = await this.expensesRepository.findOne(id, ability);
    if (!row) {
      throw new NotFoundException('Expense not found');
    }
    return new ExpenseResponseDto(row);
  }

  async update(
    id: string,
    ability: AppAbility,
    dto: UpdateExpenseDto,
  ): Promise<ExpenseResponseDto> {
    const existing = await this.expensesRepository.findOne(id, ability);
    if (!existing) {
      throw new NotFoundException('Expense not found');
    }
    if (!ability.can(Action.Update, subject('Expense', existing))) {
      throw new ForbiddenException();
    }

    if (Object.keys(dto).length === 0) {
      return new ExpenseResponseDto(existing);
    }

    if (dto.projectId !== undefined && dto.projectId !== null) {
      const project = await this.projectsRepository.findOne(dto.projectId, ability);
      if (!project) {
        throw new NotFoundException('Project not found');
      }
    }

    const patch: Parameters<ExpensesRepository['update']>[1] = {};
    if (dto.description !== undefined) patch.description = dto.description.trim();
    if (dto.category !== undefined) {
      patch.category =
        dto.category === null || dto.category.trim() === '' ? null : dto.category.trim();
    }
    if (dto.amount !== undefined) patch.amount = new Prisma.Decimal(dto.amount);
    if (dto.currency !== undefined) patch.currency = dto.currency.toUpperCase();
    if (dto.projectId !== undefined) patch.projectId = dto.projectId;
    if (dto.spentAt !== undefined) patch.spentAt = new Date(dto.spentAt);
    if (dto.notes !== undefined) {
      patch.notes = dto.notes === null || dto.notes.trim() === '' ? null : dto.notes.trim();
    }

    const updated = await this.expensesRepository.update(id, patch);
    return new ExpenseResponseDto(updated);
  }

  async delete(id: string, ability: AppAbility): Promise<void> {
    const existing = await this.expensesRepository.findOne(id, ability);
    if (!existing) {
      throw new NotFoundException('Expense not found');
    }
    if (!ability.can(Action.Delete, subject('Expense', existing))) {
      throw new ForbiddenException();
    }
    await this.expensesRepository.delete(id);
  }
}
