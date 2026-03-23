import { DatabaseService } from '@/infrastructure/database/database.service';
import { InvitationStatus } from '@/infrastructure/database/generated/enums';
import { Injectable } from '@nestjs/common';

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
    return this.database.invitation.create({
      data,
      include: {
        invitedBy: { select: { id: true, email: true, firstName: true, lastName: true } },
        company: { select: { id: true, slug: true, name: true } },
      },
    });
  }

  async findAll(opts?: { companyId?: string; status?: InvitationStatus }) {
    const where: { companyId?: string; status?: InvitationStatus } = {};
    if (opts?.companyId) where.companyId = opts.companyId;
    if (opts?.status) where.status = opts.status;

    return this.database.invitation.findMany({
      where,
      include: {
        invitedBy: { select: { id: true, email: true, firstName: true, lastName: true } },
        company: { select: { id: true, slug: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    return this.database.invitation.findUnique({
      where: { id },
      include: {
        invitedBy: { select: { id: true, email: true, firstName: true, lastName: true } },
        company: { select: { id: true, slug: true, name: true } },
      },
    });
  }

  async findByToken(token: string) {
    return this.database.invitation.findUnique({
      where: { token },
      include: {
        invitedBy: { select: { id: true, email: true, firstName: true, lastName: true } },
        company: { select: { id: true, slug: true, name: true } },
      },
    });
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
    return this.database.invitation.update({
      where: { id },
      data,
      include: {
        invitedBy: { select: { id: true, email: true, firstName: true, lastName: true } },
        company: { select: { id: true, slug: true, name: true } },
      },
    });
  }

  async delete(id: string) {
    return this.database.invitation.delete({ where: { id } });
  }
}
