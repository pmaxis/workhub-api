import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { subject } from '@casl/ability';
import { AppAbility, Action } from '@/common/ability/ability.types';
import type { Prisma } from '@/infrastructure/database/generated/client';
import { NotificationType } from '@/infrastructure/database/generated/enums';
import {
  NotificationsRepository,
  PaginatedResult,
} from '@/modules/notifications/repository/notifications.repository';
import { QueryNotificationsDto } from '@/modules/notifications/dto/query-notifications.dto';
import { NotificationResponseDto } from '@/modules/notifications/dto/notification-response.dto';
import { CreateNotificationDto } from '@/modules/notifications/dto/create-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(private readonly notificationsRepository: NotificationsRepository) {}

  async create(dto: CreateNotificationDto): Promise<NotificationResponseDto> {
    const created = await this.notificationsRepository.create({
      userId: dto.userId,
      type: dto.type ?? NotificationType.SYSTEM,
      title: dto.title,
      body: dto.body ?? null,
      data: (dto.data ?? undefined) as Prisma.InputJsonValue | undefined,
    });

    return new NotificationResponseDto(created);
  }

  async findAll(
    ability: AppAbility,
    userId: string,
    query: QueryNotificationsDto,
  ): Promise<PaginatedResult<NotificationResponseDto>> {
    const result = await this.notificationsRepository.findAll({
      ability,
      userId,
      isRead: query.isRead,
      page: query.page ?? 1,
      limit: query.limit ?? 20,
    });

    return {
      ...result,
      data: result.data.map((n) => new NotificationResponseDto(n)),
    };
  }

  async unreadCount(ability: AppAbility, userId: string): Promise<number> {
    return this.notificationsRepository.unreadCount(userId, ability);
  }

  async markRead(id: string, ability: AppAbility): Promise<void> {
    const existing = await this.notificationsRepository.findOne(id, ability);
    if (!existing) throw new NotFoundException('Notification not found');
    if (!ability.can(Action.Update, subject('Notification', existing)))
      throw new ForbiddenException();
    if (existing.isRead) return;
    await this.notificationsRepository.markRead(id);
  }

  async markAllRead(ability: AppAbility, userId: string): Promise<{ updated: number }> {
    const updated = await this.notificationsRepository.markAllRead(userId, ability);
    return { updated };
  }
}
