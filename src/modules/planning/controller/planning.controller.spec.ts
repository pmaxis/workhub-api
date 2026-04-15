import { Test, TestingModule } from '@nestjs/testing';
import { AbilityBuilder } from '@casl/ability';
import { createPrismaAbility } from '@casl/prisma';
import { Action, AppAbility } from '@/common/ability/ability.types';
import { PlanningController } from '@/modules/planning/controller/planning.controller';
import { PlanningService } from '@/modules/planning/service/planning.service';

const mockPlanningService = {
  getCalendar: jest.fn(),
  getDeadlines: jest.fn(),
};

function buildCalendarAbility(userId: string): AppAbility {
  const { can, build } = new AbilityBuilder<AppAbility>(createPrismaAbility);
  can(Action.Read, 'Task', { projectOwnerId: userId });
  can(Action.Read, 'Reminder', { userId });
  return build();
}

function buildTaskReadAbility(userId: string): AppAbility {
  const { can, build } = new AbilityBuilder<AppAbility>(createPrismaAbility);
  can(Action.Read, 'Task', { projectOwnerId: userId });
  return build();
}

describe('PlanningController', () => {
  let controller: PlanningController;
  let ability: AppAbility;

  beforeEach(async () => {
    jest.clearAllMocks();
    ability = buildCalendarAbility('u1');
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlanningController],
      providers: [{ provide: PlanningService, useValue: mockPlanningService }],
    }).compile();

    controller = module.get(PlanningController);
  });

  it('getCalendar delegates to service', async () => {
    const query = { from: '2026-04-01', to: '2026-04-30' };
    mockPlanningService.getCalendar.mockResolvedValue({ tasks: [], reminders: [] });

    await controller.getCalendar(query, ability);

    expect(mockPlanningService.getCalendar).toHaveBeenCalledWith(ability, query);
  });

  it('getDeadlines delegates to service', async () => {
    const taskAbility = buildTaskReadAbility('u1');
    mockPlanningService.getDeadlines.mockResolvedValue({ tasks: [] });
    const query = { horizonDays: 7, limit: 20 };

    await controller.getDeadlines(query, taskAbility);

    expect(mockPlanningService.getDeadlines).toHaveBeenCalledWith(taskAbility, query);
  });
});
