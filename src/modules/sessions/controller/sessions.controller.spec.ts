import { Test, TestingModule } from '@nestjs/testing';
import { SessionsController } from '@/modules/sessions/controller/sessions.controller';
import { SessionsService } from '@/modules/sessions/service/sessions.service';

const mockSessionsService = {
  findAll: jest.fn(),
  delete: jest.fn(),
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
    it('should return list of sessions', async () => {
      const sessions = [{ id: '1', userId: 'user-1' }];
      mockSessionsService.findAll.mockResolvedValue(sessions);

      const result = await controller.findAll();

      expect(result).toEqual(sessions);
      expect(mockSessionsService.findAll).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete session by id', async () => {
      mockSessionsService.delete.mockResolvedValue(undefined);

      const result = await controller.delete('1');

      expect(result).toBeUndefined();
      expect(mockSessionsService.delete).toHaveBeenCalledWith('1');
    });
  });
});
