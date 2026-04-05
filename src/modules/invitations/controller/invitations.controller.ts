import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpCode } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Action } from '@/common/ability/ability.types';
import { CheckPolicies } from '@/common/decorators/policy.decorator';
import { CurrentRequestUser } from '@/common/decorators/current-request-user.decorator';
import { Public } from '@/common/decorators/public.decorator';
import type { RequestUser } from '@/common/ability/ability.types';
import { InvitationsService } from '@/modules/invitations/service/invitations.service';
import { CreateInvitationDto } from '@/modules/invitations/dto/create-invitation.dto';
import { UpdateInvitationDto } from '@/modules/invitations/dto/update-invitation.dto';
import { InvitationResponseDto } from '@/modules/invitations/dto/invitation-response.dto';
import { WorkspaceClientMemberDto } from '@/modules/invitations/dto/workspace-client-member.dto';
import { InvitationStatus } from '@/infrastructure/database/generated/enums';

@ApiTags('Invitations')
@Controller('invitations')
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  @Post()
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Create invitation' })
  @ApiCreatedResponse({ type: InvitationResponseDto })
  @CheckPolicies((ability) => ability.can(Action.Create, 'Invitation'))
  create(
    @Body() createInvitationDto: CreateInvitationDto,
    @CurrentRequestUser() user: RequestUser,
  ): Promise<InvitationResponseDto> {
    return this.invitationsService.create(createInvitationDto, user);
  }

  @Get()
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'List invitations visible to the caller' })
  @ApiQuery({ name: 'companyId', required: false })
  @ApiQuery({ name: 'status', required: false, enum: InvitationStatus })
  @ApiOkResponse({ type: [InvitationResponseDto] })
  @CheckPolicies((ability) => ability.can(Action.Read, 'Invitation'))
  findAll(
    @CurrentRequestUser() user: RequestUser,
    @Query('companyId') companyId?: string,
    @Query('status') status?: 'PENDING' | 'ACCEPTED' | 'EXPIRED',
  ): Promise<InvitationResponseDto[]> {
    return this.invitationsService.findAll(user, companyId, status);
  }

  @Get('clients')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'List workspace client members' })
  @ApiQuery({ name: 'companyId', required: false })
  @ApiOkResponse({ type: [WorkspaceClientMemberDto] })
  @CheckPolicies((ability) => ability.can(Action.Read, 'WorkspaceMember'))
  findClients(
    @CurrentRequestUser() user: RequestUser,
    @Query('companyId') companyId?: string,
  ): Promise<Array<{ id: string; email: string; fullName: string; confirmedAt: Date }>> {
    return this.invitationsService.findWorkspaceMembers(user, companyId);
  }

  @Public()
  @Get('token/:token')
  @ApiOperation({ summary: 'Look up invitation by public token (unauthenticated)' })
  @ApiParam({ name: 'token', description: 'Invitation token from email link' })
  @ApiOkResponse({
    type: InvitationResponseDto,
    description: 'Returns null if token is invalid or expired',
  })
  findByToken(@Param('token') token: string): Promise<InvitationResponseDto | null> {
    return this.invitationsService.findByToken(token);
  }

  @Get(':id')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get invitation by ID' })
  @ApiParam({ name: 'id', description: 'Invitation ID' })
  @ApiOkResponse({ type: InvitationResponseDto })
  @CheckPolicies((ability) => ability.can(Action.Read, 'Invitation'))
  findOne(
    @Param('id') id: string,
    @CurrentRequestUser() user: RequestUser,
  ): Promise<InvitationResponseDto> {
    return this.invitationsService.findOne(id, user);
  }

  @Patch(':id')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update invitation' })
  @ApiParam({ name: 'id', description: 'Invitation ID' })
  @ApiOkResponse({ type: InvitationResponseDto })
  @CheckPolicies((ability) => ability.can(Action.Update, 'Invitation'))
  update(
    @Param('id') id: string,
    @Body() updateInvitationDto: UpdateInvitationDto,
    @CurrentRequestUser() user: RequestUser,
  ): Promise<InvitationResponseDto> {
    return this.invitationsService.update(id, user, updateInvitationDto);
  }

  @Patch(':id/accept')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Accept invitation' })
  @ApiParam({ name: 'id', description: 'Invitation ID' })
  @ApiOkResponse({ type: InvitationResponseDto })
  @CheckPolicies((ability) => ability.can(Action.Update, 'Invitation'))
  accept(
    @Param('id') id: string,
    @CurrentRequestUser() user: RequestUser,
  ): Promise<InvitationResponseDto> {
    return this.invitationsService.accept(id, user);
  }

  @Post(':id/resend')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Resend invitation email' })
  @ApiParam({ name: 'id', description: 'Invitation ID' })
  @ApiCreatedResponse({ type: InvitationResponseDto })
  @CheckPolicies((ability) => ability.can(Action.Update, 'Invitation'))
  resend(
    @Param('id') id: string,
    @CurrentRequestUser() user: RequestUser,
  ): Promise<InvitationResponseDto> {
    return this.invitationsService.resend(id, user);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Delete invitation' })
  @ApiParam({ name: 'id', description: 'Invitation ID' })
  @ApiNoContentResponse({ description: 'Invitation deleted' })
  @CheckPolicies((ability) => ability.can(Action.Delete, 'Invitation'))
  delete(@Param('id') id: string, @CurrentRequestUser() user: RequestUser): Promise<void> {
    return this.invitationsService.delete(id, user);
  }
}
