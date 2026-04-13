import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { DatabaseModule } from '@/infrastructure/database/database.module';
import config from '@/common/config/config';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { validationSchema } from '@/common/config/validation';
import { PoliciesGuard } from '@/common/guards/policy.guard';
import { AbilityModule } from '@/common/ability/ability.module';
import { UsersModule } from '@/modules/users/users.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { SessionsModule } from '@/modules/sessions/sessions.module';
import { RolesModule } from '@/modules/roles/roles.module';
import { PermissionsModule } from '@/modules/permissions/permissions.module';
import { ProfileModule } from '@/modules/profile/profile.module';
import { InvitationsModule } from './modules/invitations/invitations.module';
import { ProjectsModule } from '@/modules/projects/projects.module';
import { TasksModule } from '@/modules/tasks/tasks.module';
import { WorkspaceModule } from '@/modules/workspace/workspace.module';
import { CompaniesModule } from '@/modules/companies/companies.module';
import { NotificationsModule } from '@/modules/notifications/notifications.module';
import { TimeEntriesModule } from '@/modules/time-entries/time-entries.module';
import { InvoicesModule } from '@/modules/invoices/invoices.module';
import { PaymentsModule } from '@/modules/payments/payments.module';
import { ExpensesModule } from '@/modules/expenses/expenses.module';
import { FinanceAnalyticsModule } from '@/modules/finance-analytics/finance-analytics.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
    AbilityModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
      validationSchema: validationSchema,
    }),
    DatabaseModule,
    UsersModule,
    AuthModule,
    SessionsModule,
    RolesModule,
    PermissionsModule,
    ProfileModule,
    InvitationsModule,
    ProjectsModule,
    TasksModule,
    WorkspaceModule,
    CompaniesModule,
    NotificationsModule,
    TimeEntriesModule,
    InvoicesModule,
    PaymentsModule,
    ExpensesModule,
    FinanceAnalyticsModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PoliciesGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
  ],
})
export class AppModule {}
