import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InvitationStatus } from '@/infrastructure/database/generated/enums';
import {
  InvitationsRepository,
  MappedInvitation,
} from '@/modules/invitations/repository/invitations.repository';
import { AdminAuditLogLevel } from '@/infrastructure/database/generated/enums';
import { AdminAuditLogWriterService } from '@/modules/admin-audit-logs/service/admin-audit-log-writer.service';
import { UsersRepository } from '@/modules/users/repository/users.repository';
import { CreateInvitationDto } from '@/modules/invitations/dto/create-invitation.dto';
import { UpdateInvitationDto } from '@/modules/invitations/dto/update-invitation.dto';
import { InvitationResponseDto } from '@/modules/invitations/dto/invitation-response.dto';
import { RequestUser } from '@/common/ability/ability.types';
import { randomBytes } from 'crypto';

const INVITATION_EXPIRY_DAYS = 7;
const TOKEN_BYTES = 32;

@Injectable()
export class InvitationsService {
  constructor(
    private readonly invitationsRepository: InvitationsRepository,
    private readonly usersRepository: UsersRepository,
    private readonly adminAuditLogWriter: AdminAuditLogWriterService,
  ) {}

  async create(
    createInvitationDto: CreateInvitationDto,
    ctx: RequestUser,
  ): Promise<InvitationResponseDto> {
    this.assertCompanyInScope(createInvitationDto.companyId, ctx);

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
      invitedById: ctx.userId,
      companyId: createInvitationDto.companyId,
      expiresAt,
    });

    this.adminAuditLogWriter.enqueue({
      level: AdminAuditLogLevel.INFO,
      source: 'invitations',
      message: 'Invitation created',
      actorUserId: ctx.userId,
      context: {
        invitationId: invitation.id,
        email: invitation.email,
        companyId: invitation.companyId ?? null,
      },
    });

    return new InvitationResponseDto(invitation);
  }

  async findWorkspaceMembers(
    ctx: RequestUser,
    companyId?: string,
  ): Promise<Array<{ id: string; email: string; fullName: string; confirmedAt: Date }>> {
    this.assertCompanyInScope(companyId, ctx);

    const invitations = await this.invitationsRepository.findAll({
      companyId,
      status: InvitationStatus.ACCEPTED,
      scope: this.toScope(ctx),
    });

    const emails = [...new Set(invitations.map((i) => i.email))];
    const users =
      emails.length === 0
        ? []
        : ((await this.usersRepository.findByEmailsForInvitationLookup(emails)) ?? []);
    const userByEmail = new Map(users.map((u) => [u.email.toLowerCase(), u]));

    const fromInvites = invitations.map((inv) => {
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

    const colleagues =
      ctx.companyIds.length > 0
        ? await this.usersRepository.findColleaguesInCompanies(
            ctx.userId,
            ctx.companyIds,
            companyId,
          )
        : [];

    const seenEmails = new Set<string>();
    const merged: Array<{ id: string; email: string; fullName: string; confirmedAt: Date }> = [];

    for (const row of fromInvites) {
      const key = row.email.toLowerCase();
      if (seenEmails.has(key)) continue;
      seenEmails.add(key);
      merged.push(row);
    }

    for (const row of colleagues) {
      const key = row.email.toLowerCase();
      if (seenEmails.has(key)) continue;
      seenEmails.add(key);
      merged.push(row);
    }

    return merged;
  }

  async findAll(
    ctx: RequestUser,
    companyId?: string,
    status?: 'PENDING' | 'ACCEPTED' | 'EXPIRED',
  ): Promise<InvitationResponseDto[]> {
    this.assertCompanyInScope(companyId, ctx);

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
      scope: this.toScope(ctx),
    });
    return invitations.map((inv) => new InvitationResponseDto(inv));
  }

  async findOne(id: string, ctx: RequestUser): Promise<InvitationResponseDto> {
    const invitation = await this.invitationsRepository.findOne(id);
    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }
    if (!this.canAccessInvitation(invitation, ctx)) {
      throw new NotFoundException('Invitation not found');
    }
    return new InvitationResponseDto(invitation);
  }

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
    return new InvitationResponseDto(invitation);
  }

  async update(
    id: string,
    ctx: RequestUser,
    updateInvitationDto: UpdateInvitationDto,
  ): Promise<InvitationResponseDto> {
    await this.findOne(id, ctx);

    const invitation = await this.invitationsRepository.update(id, {
      status: updateInvitationDto.status,
    });

    this.adminAuditLogWriter.enqueue({
      level: AdminAuditLogLevel.INFO,
      source: 'invitations',
      message: 'Invitation updated',
      actorUserId: ctx.userId,
      context: { invitationId: id, status: invitation.status },
    });

    return new InvitationResponseDto(invitation);
  }

  async accept(id: string, ctx: RequestUser): Promise<InvitationResponseDto> {
    return this.update(id, ctx, { status: InvitationStatus.ACCEPTED });
  }

  async acceptForRegisteredUser(invitationId: string, registeredUserId: string): Promise<void> {
    const user = await this.usersRepository.findOne(registeredUserId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const invitation = await this.invitationsRepository.findOne(invitationId);
    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }
    if (invitation.email.toLowerCase() !== user.email.toLowerCase()) {
      throw new ForbiddenException('Invitation email does not match user');
    }
    if (invitation.status !== InvitationStatus.PENDING) {
      throw new BadRequestException('Invitation is not pending');
    }
    await this.invitationsRepository.update(invitationId, { status: InvitationStatus.ACCEPTED });

    this.adminAuditLogWriter.enqueue({
      level: AdminAuditLogLevel.INFO,
      source: 'invitations',
      message: 'Invitation accepted during registration',
      actorUserId: registeredUserId,
      context: { invitationId },
    });
  }

  async resend(id: string, ctx: RequestUser): Promise<InvitationResponseDto> {
    const invitation = await this.invitationsRepository.findOne(id);
    if (!invitation) throw new NotFoundException('Invitation not found');
    if (!this.canAccessInvitation(invitation, ctx)) {
      throw new NotFoundException('Invitation not found');
    }
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

    this.adminAuditLogWriter.enqueue({
      level: AdminAuditLogLevel.INFO,
      source: 'invitations',
      message: 'Invitation resent',
      actorUserId: ctx.userId,
      context: { invitationId: id },
    });

    return new InvitationResponseDto(updated);
  }

  async delete(id: string, ctx: RequestUser): Promise<void> {
    await this.findOne(id, ctx);
    await this.invitationsRepository.delete(id);

    this.adminAuditLogWriter.enqueue({
      level: AdminAuditLogLevel.INFO,
      source: 'invitations',
      message: 'Invitation deleted',
      actorUserId: ctx.userId,
      context: { invitationId: id },
    });
  }

  private toScope(ctx: RequestUser) {
    return {
      userId: ctx.userId,
      companyIds: ctx.companyIds,
      managedCompanyIds: ctx.managedCompanyIds,
    };
  }

  private assertCompanyInScope(companyId: string | undefined, ctx: RequestUser): void {
    if (companyId == null) return;
    if (ctx.companyIds.includes(companyId) || ctx.managedCompanyIds.includes(companyId)) return;
    throw new ForbiddenException('Company not in scope');
  }

  private canAccessInvitation(inv: MappedInvitation, ctx: RequestUser): boolean {
    if (inv.invitedById === ctx.userId) return true;
    if (inv.companyId != null && ctx.companyIds.includes(inv.companyId)) return true;
    if (inv.companyId != null && ctx.managedCompanyIds.includes(inv.companyId)) return true;
    return false;
  }
}
