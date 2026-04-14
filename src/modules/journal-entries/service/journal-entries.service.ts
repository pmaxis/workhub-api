import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { subject } from '@casl/ability';
import { AppAbility, Action } from '@/common/ability/ability.types';
import { CreateJournalEntryDto } from '@/modules/journal-entries/dto/create-journal-entry.dto';
import { UpdateJournalEntryDto } from '@/modules/journal-entries/dto/update-journal-entry.dto';
import { JournalEntryResponseDto } from '@/modules/journal-entries/dto/journal-entry-response.dto';
import { PaginatedJournalEntriesResponseDto } from '@/modules/journal-entries/dto/paginated-journal-entries-response.dto';
import { JournalEntriesRepository } from '@/modules/journal-entries/repository/journal-entries.repository';

function parseEntryDate(value: string): Date {
  const d = value.slice(0, 10);
  return new Date(`${d}T12:00:00.000Z`);
}

@Injectable()
export class JournalEntriesService {
  constructor(private readonly repository: JournalEntriesRepository) {}

  async create(
    userId: string,
    ability: AppAbility,
    dto: CreateJournalEntryDto,
  ): Promise<JournalEntryResponseDto> {
    const row = await this.repository.create({
      userId,
      entryDate: parseEntryDate(dto.entryDate),
      title: dto.title?.trim() ? dto.title.trim() : null,
      body: dto.body ?? '',
      mood: dto.mood?.trim() ? dto.mood.trim() : null,
    });
    return new JournalEntryResponseDto(row);
  }

  async findAll(
    ability: AppAbility,
    query: { from?: string; to?: string; q?: string; page?: number; limit?: number },
  ): Promise<PaginatedJournalEntriesResponseDto> {
    const result = await this.repository.findAll({
      ability,
      from: query.from,
      to: query.to,
      q: query.q,
      page: query.page ?? 1,
      limit: query.limit ?? 20,
    });
    return {
      ...result,
      data: result.data.map((r) => new JournalEntryResponseDto(r)),
    };
  }

  async findOne(id: string, ability: AppAbility): Promise<JournalEntryResponseDto> {
    const row = await this.repository.findOne(id, ability);
    if (!row) {
      throw new NotFoundException('Journal entry not found');
    }
    return new JournalEntryResponseDto(row);
  }

  async update(
    id: string,
    ability: AppAbility,
    dto: UpdateJournalEntryDto,
  ): Promise<JournalEntryResponseDto> {
    const existing = await this.repository.findOne(id, ability);
    if (!existing) {
      throw new NotFoundException('Journal entry not found');
    }
    if (!ability.can(Action.Update, subject('BrainJournalEntry', existing))) {
      throw new ForbiddenException();
    }

    if (Object.keys(dto).length === 0) {
      return new JournalEntryResponseDto(existing);
    }

    const patch: Parameters<JournalEntriesRepository['update']>[1] = {};
    if (dto.entryDate !== undefined) patch.entryDate = parseEntryDate(dto.entryDate);
    if (dto.title !== undefined) {
      patch.title = dto.title === null || dto.title.trim() === '' ? null : dto.title.trim();
    }
    if (dto.body !== undefined) patch.body = dto.body ?? '';
    if (dto.mood !== undefined) {
      patch.mood = dto.mood === null || dto.mood.trim() === '' ? null : dto.mood.trim();
    }

    const updated = await this.repository.update(id, patch);
    return new JournalEntryResponseDto(updated);
  }

  async delete(id: string, ability: AppAbility): Promise<void> {
    const existing = await this.repository.findOne(id, ability);
    if (!existing) {
      throw new NotFoundException('Journal entry not found');
    }
    if (!ability.can(Action.Delete, subject('BrainJournalEntry', existing))) {
      throw new ForbiddenException();
    }
    await this.repository.delete(id);
  }
}
