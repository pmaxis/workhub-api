import { Test, TestingModule } from '@nestjs/testing';
import { SessionsController } from '@/modules/sessions/controller/sessions.controller';
import { SessionsService } from '@/modules/sessions/service/sessions.service';
import { CreateSessionDto } from '@/modules/sessions/dto/create-session.dto';

const mockSessionsService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
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

  describe('create', () => {
    it('should create session and return result', async () => {
      const dto: CreateSessionDto = {
        userId: 'user-1',
        refreshToken: 'hash',
        expiresAt: new Date(),
        ipAddress: '127.0.0.1',
        userAgent: 'test',
      };
      const created = { id: 'session-1', ...dto };
      mockSessionsService.create.mockResolvedValue(created);

      const result = await controller.create(dto);

      expect(result).toEqual(created);
      expect(mockSessionsService.create).toHaveBeenCalledWith(dto);
    });
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

  describe('findOne', () => {
    it('should return session by id', async () => {
      const session = { id: '1', userId: 'user-1' };
      mockSessionsService.findOne.mockResolvedValue(session);

      const result = await controller.findOne('1');

      expect(result).toEqual(session);
      expect(mockSessionsService.findOne).toHaveBeenCalledWith('1');
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
