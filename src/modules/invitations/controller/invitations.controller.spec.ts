import { Test, TestingModule } from '@nestjs/testing';
import { InvitationsController } from '@/modules/invitations/controller/invitations.controller';
import { InvitationsService } from '@/modules/invitations/service/invitations.service';

describe('InvitationsController', () => {
  let controller: InvitationsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InvitationsController],
      providers: [
        {
          provide: InvitationsService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findClientsWithUserInfo: jest.fn(),
            findByToken: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            accept: jest.fn(),
            resend: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<InvitationsController>(InvitationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
