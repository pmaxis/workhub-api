import { Test, TestingModule } from '@nestjs/testing';
import { InvitationsService } from '@/modules/invitations/service/invitations.service';
import { InvitationsRepository } from '@/modules/invitations/repository/invitations.repository';
import { UsersRepository } from '@/modules/users/repository/users.repository';

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
            findOne: jest.fn(),
            findByToken: jest.fn(),
            findByEmailAndCompany: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: UsersRepository,
          useValue: {
            findByEmailsForInvitationLookup: jest.fn(),
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
