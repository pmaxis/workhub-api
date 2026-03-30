import { Injectable } from '@nestjs/common';
import { DatabaseService } from '@/infrastructure/database/database.service';
import { Invitation } from '@/infrastructure/database/generated/client';
import { InvitationStatus } from '@/infrastructure/database/generated/enums';

const invitationInclude = {
  invitedBy: { select: { id: true, email: true, firstName: true, lastName: true } },
  company: { select: { id: true, slug: true, name: true } },
} as const;

export type MappedInvitation = {
  id: string;
  email: string;
  token: string;
  status: InvitationStatus;
  companyId: string | null;
  expiresAt: Date;
  createdAt: Date;
  invitedById: string;
};

@Injectable()
export class InvitationsRepository {
  constructor(private readonly database: DatabaseService) {}

  async create(data: {
    email: string;
    token: string;
    status: InvitationStatus;
    invitedById: string;
    companyId?: string;
    expiresAt: Date;
  }) {
    const invitation = await this.database.invitation.create({
      data,
      include: invitationInclude,
    });

    return this.mapInvitation(invitation);
  }

  async findAll(opts?: { companyId?: string; status?: InvitationStatus }) {
    const where: { companyId?: string; status?: InvitationStatus } = {};
    if (opts?.companyId) where.companyId = opts.companyId;
    if (opts?.status) where.status = opts.status;

    const invitations = await this.database.invitation.findMany({
      where,
      include: invitationInclude,
      orderBy: { createdAt: 'desc' },
    });

    return invitations.map((inv) => this.mapInvitation(inv));
  }

  async findOne(id: string): Promise<MappedInvitation | null> {
    const invitation = await this.database.invitation.findUnique({
      where: { id },
      include: invitationInclude,
    });

    if (!invitation) {
      return null;
    }

    return this.mapInvitation(invitation);
  }

  async findByToken(token: string): Promise<MappedInvitation | null> {
    const invitation = await this.database.invitation.findUnique({
      where: { token },
      include: invitationInclude,
    });

    if (!invitation) {
      return null;
    }

    return this.mapInvitation(invitation);
  }

  async findByEmailAndCompany(
    email: string,
    companyId: string | null,
    status: InvitationStatus = InvitationStatus.PENDING,
  ) {
    return this.database.invitation.findFirst({
      where: { email, companyId, status },
    });
  }

  async update(id: string, data: { status?: InvitationStatus; token?: string; expiresAt?: Date }) {
    const invitation = await this.database.invitation.update({
      where: { id },
      data,
      include: invitationInclude,
    });

    return this.mapInvitation(invitation);
  }

  async delete(id: string): Promise<void> {
    await this.database.invitation.delete({ where: { id } });
  }

  private mapInvitation(
    inv: Invitation & {
      invitedBy?: { id: string; email: string; firstName: string; lastName: string };
      company?: { id: string; slug: string; name: string } | null;
    },
  ): MappedInvitation {
    return {
      id: inv.id,
      email: inv.email,
      token: inv.token,
      status: inv.status,
      companyId: inv.companyId,
      expiresAt: inv.expiresAt,
      createdAt: inv.createdAt,
      invitedById: inv.invitedById,
    };
  }
}
