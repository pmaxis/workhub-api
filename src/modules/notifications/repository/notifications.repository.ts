import { Injectable } from '@nestjs/common';
import { accessibleBy } from '@casl/prisma';
import type { Notification, Prisma } from '@/infrastructure/database/generated/client';
import { NotificationType } from '@/infrastructure/database/generated/enums';
import { DatabaseService } from '@/infrastructure/database/database.service';
import { AppAbility, Action } from '@/common/ability/ability.types';

export interface FindAllNotificationsOptions {
  ability: AppAbility;
  userId: string;
  isRead?: boolean;
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

@Injectable()
export class NotificationsRepository {
  constructor(private readonly database: DatabaseService) {}

  async create(data: {
    userId: string;
    type: NotificationType;
    title: string;
    body?: string | null;
    data?: Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput;
  }) {
    return this.database.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        body: data.body ?? null,
        data: data.data ?? undefined,
      },
    });
  }

  async findAll(options: FindAllNotificationsOptions): Promise<PaginatedResult<Notification>> {
    const { ability, userId, isRead, page, limit } = options;
    const skip = (page - 1) * limit;

    const where: Prisma.NotificationWhereInput = {
      AND: [this.abilityFilter(ability), { userId }, ...(isRead === undefined ? [] : [{ isRead }])],
    };

    const [items, total] = await this.database.$transaction([
      this.database.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.database.notification.count({ where }),
    ]);

    return { data: items, total, page, limit };
  }

  findOne(id: string, ability: AppAbility) {
    const where: Prisma.NotificationWhereInput = { AND: [this.abilityFilter(ability), { id }] };
    return this.database.notification.findFirst({ where });
  }

  async markRead(id: string): Promise<void> {
    await this.database.notification.update({
      where: { id },
      data: { isRead: true, readAt: new Date() },
    });
  }

  async markAllRead(userId: string, ability: AppAbility): Promise<number> {
    const where: Prisma.NotificationWhereInput = {
      AND: [this.abilityFilter(ability), { userId }, { isRead: false }],
    };
    const res = await this.database.notification.updateMany({
      where,
      data: { isRead: true, readAt: new Date() },
    });
    return res.count;
  }

  async unreadCount(userId: string, ability: AppAbility): Promise<number> {
    const where: Prisma.NotificationWhereInput = {
      AND: [this.abilityFilter(ability), { userId }, { isRead: false }],
    };
    return this.database.notification.count({ where });
  }

  private abilityFilter(ability: AppAbility): Prisma.NotificationWhereInput {
    const filters = accessibleBy(ability, Action.Read) as Record<
      string,
      Prisma.NotificationWhereInput
    >;
    return filters['Notification'] ?? {};
  }
}
