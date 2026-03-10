import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { SessionsService } from '@/modules/sessions/service/sessions.service';
import { CreateSessionDto } from '@/modules/sessions/dto/create-session.dto';

@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post()
  create(@Body() createSessionDto: CreateSessionDto) {
    return this.sessionsService.create(createSessionDto);
  }

  @Get()
  findAll() {
    return this.sessionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sessionsService.findOne(id);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.sessionsService.delete(id);
  }
}
