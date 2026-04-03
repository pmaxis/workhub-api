import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpCode } from '@nestjs/common';
import { Action } from '@/common/ability/ability.types';
import { CheckPolicies } from '@/common/decorators/policy.decorator';
import { CurrentRequestUser } from '@/common/decorators/current-request-user.decorator';
import { Public } from '@/common/decorators/public.decorator';
import type { RequestUser } from '@/common/ability/ability.types';
import { InvitationsService } from '@/modules/invitations/service/invitations.service';
import { CreateInvitationDto } from '@/modules/invitations/dto/create-invitation.dto';
import { UpdateInvitationDto } from '@/modules/invitations/dto/update-invitation.dto';
import { InvitationResponseDto } from '@/modules/invitations/dto/invitation-response.dto';

@Controller('invitations')
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  @Post()
  @CheckPolicies((ability) => ability.can(Action.Create, 'Invitation'))
  create(
    @Body() createInvitationDto: CreateInvitationDto,
    @CurrentRequestUser() user: RequestUser,
  ): Promise<InvitationResponseDto> {
    return this.invitationsService.create(createInvitationDto, user);
  }

  @Get()
  @CheckPolicies((ability) => ability.can(Action.Read, 'Invitation'))
  findAll(
    @CurrentRequestUser() user: RequestUser,
    @Query('companyId') companyId?: string,
    @Query('status') status?: 'PENDING' | 'ACCEPTED' | 'EXPIRED',
  ): Promise<InvitationResponseDto[]> {
    return this.invitationsService.findAll(user, companyId, status);
  }

  @Get('clients')
  @CheckPolicies((ability) => ability.can(Action.Read, 'WorkspaceMember'))
  findClients(
    @CurrentRequestUser() user: RequestUser,
    @Query('companyId') companyId?: string,
  ): Promise<Array<{ id: string; email: string; fullName: string; confirmedAt: Date }>> {
    return this.invitationsService.findWorkspaceMembers(user, companyId);
  }

  @Public()
  @Get('token/:token')
  findByToken(@Param('token') token: string): Promise<InvitationResponseDto | null> {
    return this.invitationsService.findByToken(token);
  }

  @Get(':id')
  @CheckPolicies((ability) => ability.can(Action.Read, 'Invitation'))
  findOne(
    @Param('id') id: string,
    @CurrentRequestUser() user: RequestUser,
  ): Promise<InvitationResponseDto> {
    return this.invitationsService.findOne(id, user);
  }

  @Patch(':id')
  @CheckPolicies((ability) => ability.can(Action.Update, 'Invitation'))
  update(
    @Param('id') id: string,
    @Body() updateInvitationDto: UpdateInvitationDto,
    @CurrentRequestUser() user: RequestUser,
  ): Promise<InvitationResponseDto> {
    return this.invitationsService.update(id, user, updateInvitationDto);
  }

  @Patch(':id/accept')
  @CheckPolicies((ability) => ability.can(Action.Update, 'Invitation'))
  accept(
    @Param('id') id: string,
    @CurrentRequestUser() user: RequestUser,
  ): Promise<InvitationResponseDto> {
    return this.invitationsService.accept(id, user);
  }

  @Post(':id/resend')
  @CheckPolicies((ability) => ability.can(Action.Update, 'Invitation'))
  resend(
    @Param('id') id: string,
    @CurrentRequestUser() user: RequestUser,
  ): Promise<InvitationResponseDto> {
    return this.invitationsService.resend(id, user);
  }

  @Delete(':id')
  @HttpCode(204)
  @CheckPolicies((ability) => ability.can(Action.Delete, 'Invitation'))
  delete(@Param('id') id: string, @CurrentRequestUser() user: RequestUser): Promise<void> {
    return this.invitationsService.delete(id, user);
  }
}
