import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { InvitationStatus } from '@/infrastructure/database/generated/enums';
import {
  InvitationsRepository,
  type InvitationScopeContext,
} from '@/modules/invitations/repository/invitations.repository';
import { InvitationsService } from '@/modules/invitations/service/invitations.service';
import { UsersRepository } from '@/modules/users/repository/users.repository';
import { CreateInvitationDto } from '@/modules/invitations/dto/create-invitation.dto';
import { InvitationResponseDto } from '@/modules/invitations/dto/invitation-response.dto';
import type { RequestUser } from '@/common/ability/ability.types';

const invitedById = 'user-inviter';
const invitationId = 'inv-1';
const companyId = 'comp-1';

const baseCtx = (over: Partial<RequestUser> = {}): RequestUser => ({
  userId: invitedById,
  sessionId: 'sess',
  permissions: [],
  companyIds: [],
  managedCompanyIds: [],
  ...over,
});

const baseInvitation = {
  id: invitationId,
  email: 'guest@example.com',
  token: 'tok',
  status: InvitationStatus.PENDING,
  companyId,
  expiresAt: new Date('2026-12-31'),
  createdAt: new Date('2026-01-01'),
  invitedById,
};

const mockInvitationsRepository = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  findByToken: jest.fn(),
  findByEmailAndCompany: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const mockUsersRepository = {
  findByEmailsForInvitationLookup: jest.fn(),
  findColleaguesInCompanies: jest.fn(),
};

type InvitationCreatePayload = {
  email: string;
  token: string;
  status: (typeof InvitationStatus)[keyof typeof InvitationStatus];
  invitedById: string;
  companyId?: string;
  expiresAt: Date;
};

type ResendUpdatePayload = { token: string; expiresAt: Date };

type FindAllRepositoryArgs = {
  companyId?: string;
  status?: InvitationStatus;
  scope: InvitationScopeContext;
};

function firstFindAllArgs(findAllMock: { mock: { calls: unknown } }): FindAllRepositoryArgs {
  const calls = findAllMock.mock.calls as [FindAllRepositoryArgs][];
  const first = calls[0];
  if (!first?.[0]) {
    throw new Error('expected findAll to have been called');
  }
  return first[0];
}

describe('InvitationsService', () => {
  let service: InvitationsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvitationsService,
        { provide: InvitationsRepository, useValue: mockInvitationsRepository },
        { provide: UsersRepository, useValue: mockUsersRepository },
      ],
    }).compile();

    service = module.get<InvitationsService>(InvitationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const dto: CreateInvitationDto = { email: 'new@example.com', companyId };

    it('should create invitation when no pending duplicate exists', async () => {
      mockInvitationsRepository.findByEmailAndCompany.mockResolvedValue(null);
      mockInvitationsRepository.create.mockResolvedValue({
        id: invitationId,
        email: dto.email,
        token: 'generated-token',
        status: InvitationStatus.PENDING,
        companyId,
        expiresAt: new Date('2026-07-08'),
        createdAt: new Date('2026-01-02'),
        invitedById,
      });

      const result = await service.create(dto, baseCtx({ managedCompanyIds: [companyId] }));

      expect(mockInvitationsRepository.findByEmailAndCompany).toHaveBeenCalledWith(
        dto.email,
        companyId,
        InvitationStatus.PENDING,
      );
      expect(mockInvitationsRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: dto.email,
          status: InvitationStatus.PENDING,
          invitedById,
          companyId,
        }),
      );
      const createCalls = mockInvitationsRepository.create.mock.calls as unknown as [
        [InvitationCreatePayload],
      ];
      const createArg = createCalls[0][0];
      expect(createArg.token.length).toBe(64);
      expect(createArg.expiresAt).toBeInstanceOf(Date);
      expect(result).toBeInstanceOf(InvitationResponseDto);
      expect(result).toMatchObject({
        id: invitationId,
        email: dto.email,
        status: InvitationStatus.PENDING,
        companyId,
      });
    });

    it('should use null companyId when omitted', async () => {
      const dtoNoCompany: CreateInvitationDto = { email: 'solo@example.com' };
      mockInvitationsRepository.findByEmailAndCompany.mockResolvedValue(null);
      mockInvitationsRepository.create.mockResolvedValue({
        id: invitationId,
        email: dtoNoCompany.email,
        token: 't',
        status: InvitationStatus.PENDING,
        companyId: null,
        expiresAt: new Date('2026-07-08'),
        createdAt: new Date('2026-01-03'),
        invitedById,
      });

      await service.create(dtoNoCompany, baseCtx());

      expect(mockInvitationsRepository.findByEmailAndCompany).toHaveBeenCalledWith(
        dtoNoCompany.email,
        null,
        InvitationStatus.PENDING,
      );
    });

    it('should throw ForbiddenException when companyId not in scope', async () => {
      await expect(service.create(dto, baseCtx())).rejects.toThrow(ForbiddenException);
      expect(mockInvitationsRepository.create).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when pending invitation already exists', async () => {
      mockInvitationsRepository.findByEmailAndCompany.mockResolvedValue({ id: 'existing' });

      await expect(
        service.create(dto, baseCtx({ managedCompanyIds: [companyId] })),
      ).rejects.toThrow(ConflictException);
      expect(mockInvitationsRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('findWorkspaceMembers', () => {
    it('should return empty array when no accepted invitations and no colleagues', async () => {
      mockInvitationsRepository.findAll.mockResolvedValue([]);
      mockUsersRepository.findColleaguesInCompanies.mockResolvedValue([]);

      const result = await service.findWorkspaceMembers(
        baseCtx({ companyIds: [companyId] }),
        companyId,
      );

      expect(result).toEqual([]);
      expect(mockUsersRepository.findByEmailsForInvitationLookup).not.toHaveBeenCalled();
    });

    it('should merge user names and include colleagues', async () => {
      const inv = {
        ...baseInvitation,
        id: 'i1',
        email: 'a@x.com',
        status: InvitationStatus.ACCEPTED,
      };
      mockInvitationsRepository.findAll.mockResolvedValue([inv]);
      mockUsersRepository.findByEmailsForInvitationLookup.mockResolvedValue([]);
      mockUsersRepository.findColleaguesInCompanies.mockResolvedValue([
        {
          id: 'u2',
          email: 'colleague@x.com',
          fullName: 'Colleague Name',
          confirmedAt: new Date('2026-03-01'),
        },
      ]);

      const result = await service.findWorkspaceMembers(
        baseCtx({ companyIds: [companyId] }),
        companyId,
      );

      expect(mockInvitationsRepository.findAll).toHaveBeenCalledTimes(1);
      const findWorkspaceCall = firstFindAllArgs(mockInvitationsRepository.findAll);
      expect(findWorkspaceCall.companyId).toBe(companyId);
      expect(findWorkspaceCall.status).toBe(InvitationStatus.ACCEPTED);
      expect(findWorkspaceCall.scope).toEqual({
        userId: invitedById,
        companyIds: [companyId],
        managedCompanyIds: [],
      });
      expect(result.map((r) => r.email)).toContain('a@x.com');
      expect(result.map((r) => r.email)).toContain('colleague@x.com');
    });

    it('should build fullName from user and prefer user createdAt', async () => {
      const inv = {
        ...baseInvitation,
        id: 'i2',
        email: 'User@X.com',
        status: InvitationStatus.ACCEPTED,
      };
      const userCreated = new Date('2026-02-01');
      mockInvitationsRepository.findAll.mockResolvedValue([inv]);
      mockUsersRepository.findByEmailsForInvitationLookup.mockResolvedValue([
        {
          email: 'user@x.com',
          lastName: 'Doe',
          firstName: 'Jane',
          thirdName: null,
          createdAt: userCreated,
        },
      ]);
      mockUsersRepository.findColleaguesInCompanies.mockResolvedValue([]);

      const result = await service.findWorkspaceMembers(baseCtx());

      expect(result[0].fullName).toBe('Doe Jane');
      expect(result[0].confirmedAt).toEqual(userCreated);
    });
  });

  describe('findAll', () => {
    it('should default to PENDING when status omitted', async () => {
      mockInvitationsRepository.findAll.mockResolvedValue([]);

      await service.findAll(baseCtx({ managedCompanyIds: [companyId] }), companyId);

      expect(mockInvitationsRepository.findAll).toHaveBeenCalledTimes(1);
      const findAllPendingCall = firstFindAllArgs(mockInvitationsRepository.findAll);
      expect(findAllPendingCall.companyId).toBe(companyId);
      expect(findAllPendingCall.status).toBe(InvitationStatus.PENDING);
      expect(findAllPendingCall.scope).toEqual({
        userId: invitedById,
        companyIds: [],
        managedCompanyIds: [companyId],
      });
    });

    it('should map query status and return DTOs', async () => {
      mockInvitationsRepository.findAll.mockResolvedValue([baseInvitation]);

      const result = await service.findAll(baseCtx(), undefined, 'ACCEPTED');

      expect(mockInvitationsRepository.findAll).toHaveBeenCalledTimes(1);
      const findAllAcceptedCall = firstFindAllArgs(mockInvitationsRepository.findAll);
      expect(findAllAcceptedCall.companyId).toBeUndefined();
      expect(findAllAcceptedCall.status).toBe(InvitationStatus.ACCEPTED);
      expect(findAllAcceptedCall.scope).toEqual({
        userId: invitedById,
        companyIds: [],
        managedCompanyIds: [],
      });
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(InvitationResponseDto);
    });
  });

  describe('findOne', () => {
    it('should return invitation when in scope', async () => {
      mockInvitationsRepository.findOne.mockResolvedValue(baseInvitation);

      const result = await service.findOne(
        invitationId,
        baseCtx({ managedCompanyIds: [companyId] }),
      );

      expect(result).toBeInstanceOf(InvitationResponseDto);
      expect(result.id).toBe(invitationId);
    });

    it('should throw NotFoundException when missing', async () => {
      mockInvitationsRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(invitationId, baseCtx())).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when out of scope', async () => {
      mockInvitationsRepository.findOne.mockResolvedValue(baseInvitation);

      await expect(
        service.findOne(invitationId, baseCtx({ userId: 'other-user' })),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getInvitationForRegistration', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2026-06-01'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should return null when token not found', async () => {
      mockInvitationsRepository.findByToken.mockResolvedValue(null);

      expect(await service.getInvitationForRegistration('t')).toBeNull();
    });

    it('should return null when status is not PENDING', async () => {
      mockInvitationsRepository.findByToken.mockResolvedValue({
        ...baseInvitation,
        status: InvitationStatus.ACCEPTED,
      });

      expect(await service.getInvitationForRegistration('t')).toBeNull();
      expect(mockInvitationsRepository.update).not.toHaveBeenCalled();
    });

    it('should expire and return null when past expiry', async () => {
      mockInvitationsRepository.findByToken.mockResolvedValue({
        ...baseInvitation,
        expiresAt: new Date('2026-05-01'),
      });

      expect(await service.getInvitationForRegistration('t')).toBeNull();
      expect(mockInvitationsRepository.update).toHaveBeenCalledWith(invitationId, {
        status: InvitationStatus.EXPIRED,
      });
    });

    it('should return registration payload when valid', async () => {
      mockInvitationsRepository.findByToken.mockResolvedValue({
        ...baseInvitation,
        expiresAt: new Date('2026-07-01'),
      });

      const result = await service.getInvitationForRegistration('tok');

      expect(result).toEqual({
        id: invitationId,
        email: baseInvitation.email,
        invitedById,
      });
    });
  });

  describe('findByToken', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2026-06-01'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should return null and expire when past expiry', async () => {
      mockInvitationsRepository.findByToken.mockResolvedValue({
        ...baseInvitation,
        expiresAt: new Date('2020-01-01'),
      });

      expect(await service.findByToken('t')).toBeNull();
      expect(mockInvitationsRepository.update).toHaveBeenCalledWith(invitationId, {
        status: InvitationStatus.EXPIRED,
      });
    });

    it('should return DTO when pending and not expired', async () => {
      mockInvitationsRepository.findByToken.mockResolvedValue({
        ...baseInvitation,
        expiresAt: new Date('2026-12-31'),
      });

      const result = await service.findByToken('tok');

      expect(result).toBeInstanceOf(InvitationResponseDto);
      expect(result?.email).toBe(baseInvitation.email);
    });
  });

  describe('update', () => {
    it('should update after findOne', async () => {
      mockInvitationsRepository.findOne.mockResolvedValue(baseInvitation);
      const updated = { ...baseInvitation, status: InvitationStatus.EXPIRED };
      mockInvitationsRepository.update.mockResolvedValue(updated);

      const result = await service.update(
        invitationId,
        baseCtx({ managedCompanyIds: [companyId] }),
        { status: InvitationStatus.EXPIRED },
      );

      expect(mockInvitationsRepository.update).toHaveBeenCalledWith(invitationId, {
        status: InvitationStatus.EXPIRED,
      });
      expect(result.status).toBe(InvitationStatus.EXPIRED);
    });
  });

  describe('accept', () => {
    it('should set status to ACCEPTED', async () => {
      mockInvitationsRepository.findOne.mockResolvedValue(baseInvitation);
      const accepted = { ...baseInvitation, status: InvitationStatus.ACCEPTED };
      mockInvitationsRepository.update.mockResolvedValue(accepted);

      const result = await service.accept(
        invitationId,
        baseCtx({ managedCompanyIds: [companyId] }),
      );

      expect(mockInvitationsRepository.update).toHaveBeenCalledWith(invitationId, {
        status: InvitationStatus.ACCEPTED,
      });
      expect(result.status).toBe(InvitationStatus.ACCEPTED);
    });
  });

  describe('resend', () => {
    it('should throw NotFoundException when invitation missing', async () => {
      mockInvitationsRepository.findOne.mockResolvedValue(null);

      await expect(service.resend(invitationId, baseCtx())).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when not PENDING', async () => {
      mockInvitationsRepository.findOne.mockResolvedValue({
        ...baseInvitation,
        status: InvitationStatus.ACCEPTED,
      });

      await expect(
        service.resend(invitationId, baseCtx({ managedCompanyIds: [companyId] })),
      ).rejects.toThrow(BadRequestException);
      expect(mockInvitationsRepository.update).not.toHaveBeenCalled();
    });

    it('should refresh token and expiry for pending invitation', async () => {
      mockInvitationsRepository.findOne.mockResolvedValue(baseInvitation);
      const refreshed = {
        ...baseInvitation,
        token: 'new-token',
        expiresAt: new Date('2026-08-01'),
      };
      mockInvitationsRepository.update.mockResolvedValue(refreshed);

      const result = await service.resend(
        invitationId,
        baseCtx({ managedCompanyIds: [companyId] }),
      );

      expect(mockInvitationsRepository.update).toHaveBeenCalledTimes(1);
      const updateCalls = mockInvitationsRepository.update.mock.calls as unknown as [
        [string, ResendUpdatePayload],
      ];
      expect(updateCalls[0][0]).toBe(invitationId);
      const updateArg = updateCalls[0][1];
      expect(updateArg.token.length).toBe(64);
      expect(updateArg.expiresAt).toBeInstanceOf(Date);
      expect(result).toBeInstanceOf(InvitationResponseDto);
    });
  });

  describe('delete', () => {
    it('should delete after findOne', async () => {
      mockInvitationsRepository.findOne.mockResolvedValue(baseInvitation);
      mockInvitationsRepository.delete.mockResolvedValue(undefined);

      await service.delete(invitationId, baseCtx({ managedCompanyIds: [companyId] }));

      expect(mockInvitationsRepository.delete).toHaveBeenCalledWith(invitationId);
    });

    it('should propagate NotFoundException from findOne', async () => {
      mockInvitationsRepository.findOne.mockResolvedValue(null);

      await expect(service.delete(invitationId, baseCtx())).rejects.toThrow(NotFoundException);
      expect(mockInvitationsRepository.delete).not.toHaveBeenCalled();
    });
  });
});
