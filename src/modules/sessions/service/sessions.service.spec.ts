import { Test, TestingModule } from '@nestjs/testing';
import { SessionsService } from '@/modules/sessions/service/sessions.service';
import { SessionsRepository } from '@/modules/sessions/repository/sessions.repository';
import { CreateSessionDto } from '@/modules/sessions/dto/create-session.dto';

const mockSessionsRepository = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  findOneByToken: jest.fn(),
  updateRefreshToken: jest.fn(),
  delete: jest.fn(),
};

describe('SessionsService', () => {
  let service: SessionsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionsService,
        { provide: SessionsRepository, useValue: mockSessionsRepository },
      ],
    }).compile();

    service = module.get<SessionsService>(SessionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create session', async () => {
      const dto: CreateSessionDto = {
        userId: 'user-1',
        refreshToken: 'hash',
        expiresAt: new Date(),
        ipAddress: '127.0.0.1',
        userAgent: 'test',
      };
      const created = { id: 'session-1', ...dto };
      mockSessionsRepository.create.mockResolvedValue(created);

      const result = await service.create(dto);

      expect(result).toEqual(created);
      expect(mockSessionsRepository.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should return all sessions', async () => {
      const sessions = [{ id: '1', userId: 'user-1' }];
      mockSessionsRepository.findAll.mockResolvedValue(sessions);

      const result = await service.findAll();

      expect(result).toEqual(sessions);
      expect(mockSessionsRepository.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return session by id', async () => {
      const session = { id: '1', userId: 'user-1' };
      mockSessionsRepository.findOne.mockResolvedValue(session);

      const result = await service.findOne('1');

      expect(result).toEqual(session);
      expect(mockSessionsRepository.findOne).toHaveBeenCalledWith('1');
    });
  });

  describe('findOneByToken', () => {
    it('should return session by token hash', async () => {
      const session = { id: '1', refreshToken: 'hash' };
      mockSessionsRepository.findOneByToken.mockResolvedValue(session);

      const result = await service.findOneByToken('hash');

      expect(result).toEqual(session);
      expect(mockSessionsRepository.findOneByToken).toHaveBeenCalledWith('hash');
    });
  });

  describe('updateRefreshToken', () => {
    it('should update session refresh token and expiry', async () => {
      const expiresAt = new Date();
      mockSessionsRepository.updateRefreshToken.mockResolvedValue(undefined);

      await service.updateRefreshToken('session-1', 'new-hash', expiresAt);

      expect(mockSessionsRepository.updateRefreshToken).toHaveBeenCalledWith(
        'session-1',
        'new-hash',
        expiresAt,
      );
    });
  });

  describe('delete', () => {
    it('should delete session by id', async () => {
      mockSessionsRepository.delete.mockResolvedValue(undefined);

      await service.delete('session-1');

      expect(mockSessionsRepository.delete).toHaveBeenCalledWith('session-1');
    });
  });
});
