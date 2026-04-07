import { Body, Controller, Get, HttpCode, Param, Patch, Post, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CheckPolicies } from '@/common/decorators/policy.decorator';
import { CurrentAbility } from '@/common/decorators/current-ability.decorator';
import { CurrentUserId } from '@/common/decorators/current-user.decorator';
import { Action } from '@/common/ability/ability.types';
import type { AppAbility } from '@/common/ability/ability.types';
import { NotificationsService } from '@/modules/notifications/service/notifications.service';
import { QueryNotificationsDto } from '@/modules/notifications/dto/query-notifications.dto';
import { PaginatedNotificationsResponseDto } from '@/modules/notifications/dto/paginated-notifications-response.dto';
import { NotificationResponseDto } from '@/modules/notifications/dto/notification-response.dto';
import { UnreadCountResponseDto } from '@/modules/notifications/dto/unread-count-response.dto';
import { CreateNotificationDto } from '@/modules/notifications/dto/create-notification.dto';

@ApiTags('Notifications')
@ApiBearerAuth('access-token')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create notification (admin/system)' })
  @ApiCreatedResponse({ type: NotificationResponseDto })
  @CheckPolicies((ability) => ability.can(Action.Create, 'Notification'))
  create(@Body() dto: CreateNotificationDto): Promise<NotificationResponseDto> {
    return this.notificationsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List current user notifications (paginated, CASL-filtered)' })
  @ApiOkResponse({ type: PaginatedNotificationsResponseDto })
  @CheckPolicies((ability) => ability.can(Action.Read, 'Notification'))
  findAll(
    @Query() query: QueryNotificationsDto,
    @CurrentUserId() userId: string,
    @CurrentAbility() ability: AppAbility,
  ) {
    return this.notificationsService.findAll(ability, userId, query);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Unread notifications count for current user' })
  @ApiOkResponse({ type: UnreadCountResponseDto })
  @CheckPolicies((ability) => ability.can(Action.Read, 'Notification'))
  async unreadCount(
    @CurrentUserId() userId: string,
    @CurrentAbility() ability: AppAbility,
  ): Promise<UnreadCountResponseDto> {
    const unreadCount = await this.notificationsService.unreadCount(ability, userId);
    return { unreadCount };
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all current user notifications as read' })
  @ApiOkResponse({ schema: { properties: { updated: { type: 'number' } } } })
  @CheckPolicies((ability) => ability.can(Action.Update, 'Notification'))
  markAllRead(@CurrentUserId() userId: string, @CurrentAbility() ability: AppAbility) {
    return this.notificationsService.markAllRead(ability, userId);
  }

  @Patch(':id/read')
  @HttpCode(204)
  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @ApiNoContentResponse({ description: 'Notification marked as read' })
  @CheckPolicies((ability) => ability.can(Action.Update, 'Notification'))
  markRead(@Param('id') id: string, @CurrentAbility() ability: AppAbility): Promise<void> {
    return this.notificationsService.markRead(id, ability);
  }
}
