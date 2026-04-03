import { Test, TestingModule } from '@nestjs/testing';
import { InvitationStatus } from '@/infrastructure/database/generated/enums';
import { InvitationsController } from '@/modules/invitations/controller/invitations.controller';
import { InvitationsService } from '@/modules/invitations/service/invitations.service';
import { CreateInvitationDto } from '@/modules/invitations/dto/create-invitation.dto';
import { UpdateInvitationDto } from '@/modules/invitations/dto/update-invitation.dto';
import { InvitationResponseDto } from '@/modules/invitations/dto/invitation-response.dto';
import type { RequestUser } from '@/common/ability/ability.types';

const mockInvitationsService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findWorkspaceMembers: jest.fn(),
  findByToken: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  accept: jest.fn(),
  resend: jest.fn(),
  delete: jest.fn(),
};

const sampleUser: RequestUser = {
  userId: 'u1',
  sessionId: 's1',
  permissions: [],
  companyIds: ['c1'],
  managedCompanyIds: [],
};

const sampleInvitationDto = new InvitationResponseDto({
  id: 'inv-1',
  email: 'a@b.com',
  status: InvitationStatus.PENDING,
  companyId: 'c1',
  expiresAt: new Date(),
  createdAt: new Date(),
});

describe('InvitationsController', () => {
  let controller: InvitationsController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InvitationsController],
      providers: [{ provide: InvitationsService, useValue: mockInvitationsService }],
    }).compile();

    controller = module.get<InvitationsController>(InvitationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should delegate to service with request user', async () => {
      const dto: CreateInvitationDto = { email: 'x@y.com', companyId: 'c1' };
      mockInvitationsService.create.mockResolvedValue(sampleInvitationDto);

      const result = await controller.create(dto, sampleUser);

      expect(result).toEqual(sampleInvitationDto);
      expect(mockInvitationsService.create).toHaveBeenCalledWith(dto, sampleUser);
    });
  });

  describe('findAll', () => {
    it('should pass optional companyId and status', async () => {
      mockInvitationsService.findAll.mockResolvedValue([sampleInvitationDto]);

      const result = await controller.findAll(sampleUser, 'c1', 'PENDING');

      expect(result).toEqual([sampleInvitationDto]);
      expect(mockInvitationsService.findAll).toHaveBeenCalledWith(sampleUser, 'c1', 'PENDING');
    });

    it('should work without query params', async () => {
      mockInvitationsService.findAll.mockResolvedValue([]);

      await controller.findAll(sampleUser, undefined, undefined);

      expect(mockInvitationsService.findAll).toHaveBeenCalledWith(sampleUser, undefined, undefined);
    });
  });

  describe('findClients', () => {
    it('should delegate to findWorkspaceMembers', async () => {
      const rows = [{ id: '1', email: 'a@b.com', fullName: 'A B', confirmedAt: new Date() }];
      mockInvitationsService.findWorkspaceMembers.mockResolvedValue(rows);

      const result = await controller.findClients(sampleUser, 'c1');

      expect(result).toEqual(rows);
      expect(mockInvitationsService.findWorkspaceMembers).toHaveBeenCalledWith(sampleUser, 'c1');
    });
  });

  describe('findByToken', () => {
    it('should delegate to service', async () => {
      mockInvitationsService.findByToken.mockResolvedValue(sampleInvitationDto);

      const result = await controller.findByToken('secret-token');

      expect(result).toEqual(sampleInvitationDto);
      expect(mockInvitationsService.findByToken).toHaveBeenCalledWith('secret-token');
    });
  });

  describe('findOne', () => {
    it('should delegate to service', async () => {
      mockInvitationsService.findOne.mockResolvedValue(sampleInvitationDto);

      const result = await controller.findOne('inv-1', sampleUser);

      expect(result).toEqual(sampleInvitationDto);
      expect(mockInvitationsService.findOne).toHaveBeenCalledWith('inv-1', sampleUser);
    });
  });

  describe('update', () => {
    it('should delegate to service', async () => {
      const dto: UpdateInvitationDto = { status: InvitationStatus.EXPIRED };
      mockInvitationsService.update.mockResolvedValue(sampleInvitationDto);

      const result = await controller.update('inv-1', dto, sampleUser);

      expect(result).toEqual(sampleInvitationDto);
      expect(mockInvitationsService.update).toHaveBeenCalledWith('inv-1', sampleUser, dto);
    });
  });

  describe('accept', () => {
    it('should delegate to service', async () => {
      mockInvitationsService.accept.mockResolvedValue(sampleInvitationDto);

      const result = await controller.accept('inv-1', sampleUser);

      expect(result).toEqual(sampleInvitationDto);
      expect(mockInvitationsService.accept).toHaveBeenCalledWith('inv-1', sampleUser);
    });
  });

  describe('resend', () => {
    it('should delegate to service', async () => {
      mockInvitationsService.resend.mockResolvedValue(sampleInvitationDto);

      const result = await controller.resend('inv-1', sampleUser);

      expect(result).toEqual(sampleInvitationDto);
      expect(mockInvitationsService.resend).toHaveBeenCalledWith('inv-1', sampleUser);
    });
  });

  describe('delete', () => {
    it('should delegate to service', async () => {
      mockInvitationsService.delete.mockResolvedValue(undefined);

      await controller.delete('inv-1', sampleUser);

      expect(mockInvitationsService.delete).toHaveBeenCalledWith('inv-1', sampleUser);
    });
  });
});
