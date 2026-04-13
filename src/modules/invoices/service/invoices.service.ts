import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { subject } from '@casl/ability';
import { Prisma } from '@/infrastructure/database/generated/client';
import { InvoiceStatus } from '@/infrastructure/database/generated/enums';
import { AppAbility, Action } from '@/common/ability/ability.types';
import { ProjectsRepository } from '@/modules/projects/repository/projects.repository';
import { CreateInvoiceDto } from '@/modules/invoices/dto/create-invoice.dto';
import { UpdateInvoiceDto } from '@/modules/invoices/dto/update-invoice.dto';
import { InvoiceResponseDto } from '@/modules/invoices/dto/invoice-response.dto';
import { PaginatedInvoicesResponseDto } from '@/modules/invoices/dto/paginated-invoices-response.dto';
import { InvoicesRepository } from '@/modules/invoices/repository/invoices.repository';

@Injectable()
export class InvoicesService {
  constructor(
    private readonly invoicesRepository: InvoicesRepository,
    private readonly projectsRepository: ProjectsRepository,
  ) {}

  async create(
    userId: string,
    ability: AppAbility,
    dto: CreateInvoiceDto,
  ): Promise<InvoiceResponseDto> {
    let projectId: string | null = null;
    if (dto.projectId) {
      const project = await this.projectsRepository.findOne(dto.projectId, ability);
      if (!project) {
        throw new NotFoundException('Project not found');
      }
      projectId = project.id;
    }

    const number = dto.number ?? (await this.nextInvoiceNumber(userId));
    if (await this.invoicesRepository.existsByUserIdAndNumber(userId, number)) {
      throw new ConflictException('Invoice number already exists');
    }

    try {
      const row = await this.invoicesRepository.create({
        userId,
        projectId,
        number,
        title: dto.title?.trim() ? dto.title.trim() : null,
        amount: new Prisma.Decimal(dto.amount),
        currency: (dto.currency ?? 'USD').toUpperCase(),
        status: dto.status ?? InvoiceStatus.DRAFT,
        issuedAt: dto.issuedAt ? new Date(dto.issuedAt) : null,
        dueAt: dto.dueAt ? new Date(dto.dueAt) : null,
        notes: dto.notes?.trim() ? dto.notes.trim() : null,
      });
      return new InvoiceResponseDto(row);
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new ConflictException('Invoice number already exists');
      }
      throw e;
    }
  }

  async findAll(
    ability: AppAbility,
    query: { projectId?: string; status?: InvoiceStatus; page?: number; limit?: number },
  ): Promise<PaginatedInvoicesResponseDto> {
    const result = await this.invoicesRepository.findAll({
      ability,
      projectId: query.projectId,
      status: query.status,
      page: query.page ?? 1,
      limit: query.limit ?? 20,
    });
    return {
      ...result,
      data: result.data.map((r) => new InvoiceResponseDto(r)),
    };
  }

  async findOne(id: string, ability: AppAbility): Promise<InvoiceResponseDto> {
    const row = await this.invoicesRepository.findOne(id, ability);
    if (!row) {
      throw new NotFoundException('Invoice not found');
    }
    return new InvoiceResponseDto(row);
  }

  async update(
    id: string,
    ability: AppAbility,
    dto: UpdateInvoiceDto,
  ): Promise<InvoiceResponseDto> {
    const existing = await this.invoicesRepository.findOne(id, ability);
    if (!existing) {
      throw new NotFoundException('Invoice not found');
    }
    if (!ability.can(Action.Update, subject('Invoice', existing))) {
      throw new ForbiddenException();
    }

    if (Object.keys(dto).length === 0) {
      return new InvoiceResponseDto(existing);
    }

    if (dto.projectId !== undefined && dto.projectId !== null) {
      const project = await this.projectsRepository.findOne(dto.projectId, ability);
      if (!project) {
        throw new NotFoundException('Project not found');
      }
    }

    if (dto.number !== undefined && dto.number !== existing.number) {
      if (await this.invoicesRepository.existsByUserIdAndNumber(existing.userId, dto.number, id)) {
        throw new ConflictException('Invoice number already exists');
      }
    }

    const patch: Parameters<InvoicesRepository['update']>[1] = {};
    if (dto.number !== undefined) patch.number = dto.number;
    if (dto.title !== undefined) {
      patch.title =
        dto.title === null || String(dto.title).trim() === '' ? null : String(dto.title).trim();
    }
    if (dto.amount !== undefined) patch.amount = new Prisma.Decimal(dto.amount);
    if (dto.currency !== undefined) patch.currency = dto.currency.toUpperCase();
    if (dto.status !== undefined) patch.status = dto.status;
    if (dto.projectId !== undefined) patch.projectId = dto.projectId;
    if (dto.issuedAt !== undefined) patch.issuedAt = dto.issuedAt ? new Date(dto.issuedAt) : null;
    if (dto.dueAt !== undefined) patch.dueAt = dto.dueAt ? new Date(dto.dueAt) : null;
    if (dto.notes !== undefined) {
      patch.notes = dto.notes === null || dto.notes.trim() === '' ? null : dto.notes.trim();
    }

    try {
      const updated = await this.invoicesRepository.update(id, patch);
      return new InvoiceResponseDto(updated);
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new ConflictException('Invoice number already exists');
      }
      throw e;
    }
  }

  async delete(id: string, ability: AppAbility): Promise<void> {
    const existing = await this.invoicesRepository.findOne(id, ability);
    if (!existing) {
      throw new NotFoundException('Invoice not found');
    }
    if (!ability.can(Action.Delete, subject('Invoice', existing))) {
      throw new ForbiddenException();
    }
    await this.invoicesRepository.delete(id);
  }

  private async nextInvoiceNumber(userId: string): Promise<string> {
    const n = await this.invoicesRepository.countByUserId(userId);
    const y = new Date().getFullYear();
    return `INV-${y}-${String(n + 1).padStart(4, '0')}`;
  }
}
