import { Test, TestingModule } from '@nestjs/testing';
import { InvitationsService } from '@/modules/invitations/service/invitations.service';
import { InvitationsRepository } from '@/modules/invitations/repository/invitations.repository';
import { DatabaseService } from '@/infrastructure/database/database.service';

describe('InvitationsService', () => {
  let service: InvitationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvitationsService,
        {
          provide: InvitationsRepository,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findById: jest.fn(),
            findByToken: jest.fn(),
            findByEmailAndCompany: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: DatabaseService,
          useValue: {
            user: { findMany: jest.fn() },
            invitation: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<InvitationsService>(InvitationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
