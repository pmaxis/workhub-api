import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { subject } from '@casl/ability';
import { Prisma } from '@/infrastructure/database/generated/client';
import { AppAbility, Action } from '@/common/ability/ability.types';
import { DatabaseService } from '@/infrastructure/database/database.service';
import { CreatePaymentDto } from '@/modules/payments/dto/create-payment.dto';
import { UpdatePaymentDto } from '@/modules/payments/dto/update-payment.dto';
import { PaymentResponseDto } from '@/modules/payments/dto/payment-response.dto';
import { PaginatedPaymentsResponseDto } from '@/modules/payments/dto/paginated-payments-response.dto';
import { PaymentsRepository } from '@/modules/payments/repository/payments.repository';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly paymentsRepository: PaymentsRepository,
    private readonly database: DatabaseService,
  ) {}

  async create(userId: string, dto: CreatePaymentDto): Promise<PaymentResponseDto> {
    let invoiceId: string | null = null;
    if (dto.invoiceId) {
      const invoice = await this.database.invoice.findFirst({
        where: { id: dto.invoiceId, userId },
        select: { id: true },
      });
      if (!invoice) {
        throw new NotFoundException('Invoice not found');
      }
      invoiceId = invoice.id;
    }

    const row = await this.paymentsRepository.create({
      userId,
      invoiceId,
      amount: new Prisma.Decimal(dto.amount),
      currency: (dto.currency ?? 'USD').toUpperCase(),
      receivedAt: new Date(dto.receivedAt),
      method: dto.method?.trim() ? dto.method.trim() : null,
      notes: dto.notes?.trim() ? dto.notes.trim() : null,
    });
    return new PaymentResponseDto(row);
  }

  async findAll(
    ability: AppAbility,
    query: {
      invoiceId?: string;
      from?: string;
      to?: string;
      page?: number;
      limit?: number;
    },
  ): Promise<PaginatedPaymentsResponseDto> {
    const result = await this.paymentsRepository.findAll({
      ability,
      invoiceId: query.invoiceId,
      from: query.from ? new Date(query.from) : undefined,
      to: query.to ? new Date(query.to) : undefined,
      page: query.page ?? 1,
      limit: query.limit ?? 20,
    });
    return {
      ...result,
      data: result.data.map((r) => new PaymentResponseDto(r)),
    };
  }

  async findOne(id: string, ability: AppAbility): Promise<PaymentResponseDto> {
    const row = await this.paymentsRepository.findOne(id, ability);
    if (!row) {
      throw new NotFoundException('Payment not found');
    }
    return new PaymentResponseDto(row);
  }

  async update(
    id: string,
    userId: string,
    ability: AppAbility,
    dto: UpdatePaymentDto,
  ): Promise<PaymentResponseDto> {
    const existing = await this.paymentsRepository.findOne(id, ability);
    if (!existing) {
      throw new NotFoundException('Payment not found');
    }
    if (!ability.can(Action.Update, subject('Payment', existing))) {
      throw new ForbiddenException();
    }

    if (Object.keys(dto).length === 0) {
      return new PaymentResponseDto(existing);
    }

    if (dto.invoiceId !== undefined && dto.invoiceId !== null) {
      const invoice = await this.database.invoice.findFirst({
        where: { id: dto.invoiceId, userId },
        select: { id: true },
      });
      if (!invoice) {
        throw new NotFoundException('Invoice not found');
      }
    }

    const patch: Parameters<PaymentsRepository['update']>[1] = {};
    if (dto.invoiceId !== undefined) patch.invoiceId = dto.invoiceId;
    if (dto.amount !== undefined) patch.amount = new Prisma.Decimal(dto.amount);
    if (dto.currency !== undefined) patch.currency = dto.currency.toUpperCase();
    if (dto.receivedAt !== undefined) patch.receivedAt = new Date(dto.receivedAt);
    if (dto.method !== undefined) {
      patch.method = dto.method === null || dto.method.trim() === '' ? null : dto.method.trim();
    }
    if (dto.notes !== undefined) {
      patch.notes = dto.notes === null || dto.notes.trim() === '' ? null : dto.notes.trim();
    }

    const updated = await this.paymentsRepository.update(id, patch);
    return new PaymentResponseDto(updated);
  }

  async delete(id: string, ability: AppAbility): Promise<void> {
    const existing = await this.paymentsRepository.findOne(id, ability);
    if (!existing) {
      throw new NotFoundException('Payment not found');
    }
    if (!ability.can(Action.Delete, subject('Payment', existing))) {
      throw new ForbiddenException();
    }
    await this.paymentsRepository.delete(id);
  }
}
