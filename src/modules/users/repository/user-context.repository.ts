import { Injectable } from '@nestjs/common';
import { DatabaseService } from '@/infrastructure/database/database.service';
import { RequestUser } from '@/common/ability/ability.types';

@Injectable()
export class UserContextRepository {
  constructor(private readonly database: DatabaseService) {}

  async loadContext(userId: string, sessionId: string): Promise<RequestUser | null> {
    const now = new Date();
    const [user, session] = await Promise.all([
      this.database.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          roles: {
            select: {
              role: {
                select: {
                  permissions: {
                    select: {
                      permission: { select: { key: true } },
                    },
                  },
                },
              },
            },
          },
          clientProfile: {
            select: {
              companyMembers: {
                select: { companyId: true },
              },
            },
          },
          freelancerProfile: {
            select: {
              clients: {
                select: { companyId: true },
              },
            },
          },
        },
      }),
      this.database.session.findUnique({
        where: { id: sessionId, userId },
        select: { expiresAt: true },
      }),
    ]);

    if (!user || !session || session.expiresAt < now) return null;

    const permissions = [
      ...new Set(user.roles.flatMap((ur) => ur.role.permissions.map((rp) => rp.permission.key))),
    ];

    const companyIds = user.clientProfile?.companyMembers.map((m) => m.companyId) ?? [];

    const managedCompanyIds = [
      ...new Set(
        (user.freelancerProfile?.clients ?? [])
          .map((c) => c.companyId)
          .filter((id): id is string => id != null),
      ),
    ];

    return { userId, sessionId, permissions, companyIds, managedCompanyIds };
  }
}
