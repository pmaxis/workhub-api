import { Test, TestingModule } from '@nestjs/testing';
import { SessionsController } from '@/modules/sessions/controller/sessions.controller';
import { SessionsService } from '@/modules/sessions/service/sessions.service';

const mockSessionsService = {
  findAllForUser: jest.fn(),
  deleteForUser: jest.fn(),
};

describe('SessionsController', () => {
  let controller: SessionsController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SessionsController],
      providers: [{ provide: SessionsService, useValue: mockSessionsService }],
    }).compile();

    controller = module.get<SessionsController>(SessionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return list of sessions for current user', async () => {
      const sessions = [{ id: '1', userId: 'user-1' }];
      mockSessionsService.findAllForUser.mockResolvedValue(sessions);

      const result = await controller.findAll('user-1');

      expect(result).toEqual(sessions);
      expect(mockSessionsService.findAllForUser).toHaveBeenCalledWith('user-1');
    });
  });

  describe('delete', () => {
    it('should delete session by id for current user', async () => {
      mockSessionsService.deleteForUser.mockResolvedValue(undefined);

      const result = await controller.delete('1', 'user-1');

      expect(result).toBeUndefined();
      expect(mockSessionsService.deleteForUser).toHaveBeenCalledWith('1', 'user-1');
    });
  });
});
