import { Injectable } from '@nestjs/common';
import { AppAbility, Action } from '@/common/ability/ability.types';
import { TasksRepository } from '@/modules/tasks/repository/tasks.repository';
import { RemindersRepository } from '@/modules/reminders/repository/reminders.repository';
import { QueryPlanningCalendarDto } from '@/modules/planning/dto/query-planning-calendar.dto';
import { QueryPlanningDeadlinesDto } from '@/modules/planning/dto/query-planning-deadlines.dto';
import type { PlanningCalendarResponseDto } from '@/modules/planning/dto/planning-calendar-response.dto';
import type { PlanningDeadlinesResponseDto } from '@/modules/planning/dto/planning-deadlines-response.dto';

@Injectable()
export class PlanningService {
  constructor(
    private readonly tasksRepository: TasksRepository,
    private readonly remindersRepository: RemindersRepository,
  ) {}

  async getCalendar(
    ability: AppAbility,
    query: QueryPlanningCalendarDto,
  ): Promise<PlanningCalendarResponseDto> {
    const from = query.from.slice(0, 10);
    const to = query.to.slice(0, 10);

    const tasks = ability.can(Action.Read, 'Task')
      ? await this.tasksRepository.findByDueDateRange(ability, from, to)
      : [];

    const reminders = ability.can(Action.Read, 'Reminder')
      ? await this.remindersRepository.findActiveInRemindRange(ability, from, to)
      : [];

    return {
      tasks: tasks
        .filter((t) => t.dueAt)
        .map((t) => ({
          id: t.id,
          title: t.title,
          projectId: t.projectId,
          status: t.status,
          dueAt: t.dueAt as Date,
        })),
      reminders: reminders.map((r) => ({
        id: r.id,
        title: r.title,
        remindAt: r.remindAt,
        taskId: r.taskId,
      })),
    };
  }

  async getDeadlines(
    ability: AppAbility,
    query: QueryPlanningDeadlinesDto,
  ): Promise<PlanningDeadlinesResponseDto> {
    const horizonDays = query.horizonDays ?? 14;
    const limit = query.limit ?? 100;

    if (!ability.can(Action.Read, 'Task')) {
      return { tasks: [] };
    }

    const horizonEnd = new Date();
    horizonEnd.setUTCDate(horizonEnd.getUTCDate() + horizonDays);
    horizonEnd.setUTCHours(23, 59, 59, 999);

    const rows = await this.tasksRepository.findOpenDeadlines(ability, horizonEnd, limit);

    return {
      tasks: rows
        .filter((t) => t.dueAt)
        .map((t) => ({
          id: t.id,
          title: t.title,
          projectId: t.projectId,
          status: t.status,
          dueAt: t.dueAt as Date,
        })),
    };
  }
}
