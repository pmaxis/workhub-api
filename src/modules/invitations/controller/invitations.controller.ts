import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { InvitationsService } from '@/modules/invitations/service/invitations.service';
import { CreateInvitationDto } from '@/modules/invitations/dto/create-invitation.dto';
import { UpdateInvitationDto } from '@/modules/invitations/dto/update-invitation.dto';
import { CurrentUserId } from '@/common/decorators/current-user.decorator';
import { Public } from '@/common/decorators/public.decorator';

@Controller('invitations')
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  @Post()
  create(@Body() createInvitationDto: CreateInvitationDto, @CurrentUserId() userId: string) {
    return this.invitationsService.create(createInvitationDto, userId);
  }

  @Get()
  findAll(
    @Query('companyId') companyId?: string,
    @Query('status') status?: 'PENDING' | 'ACCEPTED' | 'EXPIRED',
  ) {
    return this.invitationsService.findAll(companyId, status);
  }

  @Get('clients')
  findClients(@Query('companyId') companyId?: string) {
    return this.invitationsService.findClientsWithUserInfo(companyId);
  }

  @Public()
  @Get('token/:token')
  findByToken(@Param('token') token: string) {
    return this.invitationsService.findByToken(token);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.invitationsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateInvitationDto: UpdateInvitationDto) {
    return this.invitationsService.update(id, updateInvitationDto);
  }

  @Patch(':id/accept')
  accept(@Param('id') id: string) {
    return this.invitationsService.accept(id);
  }

  @Post(':id/resend')
  resend(@Param('id') id: string) {
    return this.invitationsService.resend(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.invitationsService.remove(id);
  }
}
