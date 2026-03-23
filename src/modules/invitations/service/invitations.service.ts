import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InvitationStatus } from '@/infrastructure/database/generated/enums';
import { DatabaseService } from '@/infrastructure/database/database.service';
import { InvitationsRepository } from '@/modules/invitations/repository/invitations.repository';
import { CreateInvitationDto } from '@/modules/invitations/dto/create-invitation.dto';
import { UpdateInvitationDto } from '@/modules/invitations/dto/update-invitation.dto';
import { InvitationResponseDto } from '@/modules/invitations/dto/invitation-response.dto';
import { randomBytes } from 'crypto';

const INVITATION_EXPIRY_DAYS = 7;
const TOKEN_BYTES = 32;

@Injectable()
export class InvitationsService {
  constructor(
    private readonly invitationsRepository: InvitationsRepository,
    private readonly database: DatabaseService,
  ) {}

  async create(
    createInvitationDto: CreateInvitationDto,
    invitedById: string,
  ): Promise<InvitationResponseDto> {
    const existingInvitation = await this.invitationsRepository.findByEmailAndCompany(
      createInvitationDto.email,
      createInvitationDto.companyId ?? null,
      InvitationStatus.PENDING,
    );

    if (existingInvitation) {
      throw new ConflictException('An invitation for this email already exists for this company');
    }

    const token = randomBytes(TOKEN_BYTES).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + INVITATION_EXPIRY_DAYS);

    const invitation = await this.invitationsRepository.create({
      email: createInvitationDto.email,
      token,
      status: InvitationStatus.PENDING,
      invitedById,
      companyId: createInvitationDto.companyId,
      expiresAt,
    });

    return new InvitationResponseDto({
      id: invitation.id,
      email: invitation.email,
      status: invitation.status,
      companyId: invitation.companyId,
      expiresAt: invitation.expiresAt,
      createdAt: invitation.createdAt,
      token, // One-time, for building invite link
    });
  }

  async findClientsWithUserInfo(
    companyId?: string,
  ): Promise<Array<{ id: string; email: string; fullName: string; confirmedAt: Date }>> {
    const invitations = await this.invitationsRepository.findAll({
      companyId,
      status: InvitationStatus.ACCEPTED,
    });
    if (invitations.length === 0) return [];

    const emails = [...new Set(invitations.map((i) => i.email))];
    const users = await this.database.user.findMany({
      where: { email: { in: emails } },
      select: { email: true, firstName: true, lastName: true, thirdName: true, createdAt: true },
    });
    const userByEmail = new Map(users.map((u) => [u.email.toLowerCase(), u]));

    return invitations.map((inv) => {
      const user = userByEmail.get(inv.email.toLowerCase());
      const fullName = user
        ? [user.lastName, user.firstName, user.thirdName].filter(Boolean).join(' ')
        : inv.email;
      return {
        id: inv.id,
        email: inv.email,
        fullName,
        confirmedAt: user?.createdAt ?? inv.createdAt,
      };
    });
  }

  async findAll(
    companyId?: string,
    status?: 'PENDING' | 'ACCEPTED' | 'EXPIRED',
  ): Promise<InvitationResponseDto[]> {
    const statusMap: Record<string, InvitationStatus> = {
      PENDING: InvitationStatus.PENDING,
      ACCEPTED: InvitationStatus.ACCEPTED,
      EXPIRED: InvitationStatus.EXPIRED,
    };
    const effectiveStatus: InvitationStatus =
      status && status in statusMap ? statusMap[status] : InvitationStatus.PENDING;
    const invitations = await this.invitationsRepository.findAll({
      companyId,
      status: effectiveStatus,
    });
    return invitations.map(
      (inv) =>
        new InvitationResponseDto({
          id: inv.id,
          email: inv.email,
          status: inv.status,
          companyId: inv.companyId,
          expiresAt: inv.expiresAt,
          createdAt: inv.createdAt,
          token: inv.token,
        }),
    );
  }

  async findOne(id: string): Promise<InvitationResponseDto | null> {
    const invitation = await this.invitationsRepository.findById(id);
    if (!invitation) return null;
    return new InvitationResponseDto({
      id: invitation.id,
      email: invitation.email,
      status: invitation.status,
      companyId: invitation.companyId,
      expiresAt: invitation.expiresAt,
      createdAt: invitation.createdAt,
      token: invitation.token,
    });
  }

  /** Returns invitation data for registration flow. Email must match register payload. */
  async getInvitationForRegistration(
    token: string,
  ): Promise<{ id: string; email: string; invitedById: string } | null> {
    const invitation = await this.invitationsRepository.findByToken(token);
    if (!invitation) return null;
    if (invitation.status !== InvitationStatus.PENDING) return null;
    if (invitation.expiresAt < new Date()) {
      await this.invitationsRepository.update(invitation.id, { status: InvitationStatus.EXPIRED });
      return null;
    }
    return {
      id: invitation.id,
      email: invitation.email,
      invitedById: invitation.invitedById,
    };
  }

  async findByToken(token: string): Promise<InvitationResponseDto | null> {
    const invitation = await this.invitationsRepository.findByToken(token);
    if (!invitation) return null;
    if (invitation.status !== InvitationStatus.PENDING) return null;
    if (invitation.expiresAt < new Date()) {
      await this.invitationsRepository.update(invitation.id, {
        status: InvitationStatus.EXPIRED,
      });
      return null;
    }
    return new InvitationResponseDto({
      id: invitation.id,
      email: invitation.email,
      status: invitation.status,
      companyId: invitation.companyId,
      expiresAt: invitation.expiresAt,
      createdAt: invitation.createdAt,
      token: invitation.token,
    });
  }

  async update(
    id: string,
    updateInvitationDto: UpdateInvitationDto,
  ): Promise<InvitationResponseDto> {
    const existing = await this.findOne(id);
    if (!existing) throw new NotFoundException('Invitation not found');

    const invitation = await this.invitationsRepository.update(id, {
      status: updateInvitationDto.status,
    });

    return new InvitationResponseDto({
      id: invitation.id,
      email: invitation.email,
      status: invitation.status,
      companyId: invitation.companyId,
      expiresAt: invitation.expiresAt,
      createdAt: invitation.createdAt,
      token: invitation.token,
    });
  }

  async accept(id: string): Promise<InvitationResponseDto> {
    return this.update(id, { status: InvitationStatus.ACCEPTED });
  }

  async resend(id: string): Promise<InvitationResponseDto> {
    const invitation = await this.invitationsRepository.findById(id);
    if (!invitation) throw new NotFoundException('Invitation not found');
    if (invitation.status !== InvitationStatus.PENDING) {
      throw new BadRequestException('Only pending invitations can be resent');
    }

    const token = randomBytes(TOKEN_BYTES).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + INVITATION_EXPIRY_DAYS);

    const updated = await this.invitationsRepository.update(id, {
      token,
      expiresAt,
    });

    return new InvitationResponseDto({
      id: updated.id,
      email: updated.email,
      status: updated.status,
      companyId: updated.companyId,
      expiresAt: updated.expiresAt,
      createdAt: updated.createdAt,
      token: updated.token,
    });
  }

  async remove(id: string): Promise<void> {
    const existing = await this.findOne(id);
    if (!existing) throw new NotFoundException('Invitation not found');
    await this.invitationsRepository.delete(id);
  }
}
