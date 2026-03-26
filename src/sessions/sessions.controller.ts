import { Controller, Post, Get, Body, Param, Patch } from '@nestjs/common';
import { SessionsService } from './sessions.service'; 
import { Delete } from '@nestjs/common';

@Controller('sessions')
export class SessionsController {

  constructor(private sessionsService: SessionsService) {}

  @Post()
  create(@Body() body) {
    return this.sessionsService.create(body);
  }

  @Get()
  getAll() {
    return this.sessionsService.findAll();
  }

  @Get('learner/:id')
getLearnerSessions(@Param('id') id: number) {
  return this.sessionsService.getLearnerSessions(id);
} 

@Get('coach/:id')
getCoachSessions(@Param('id') id: number) {
  return this.sessionsService.getCoachSessions(id);
} 

@Delete(':id')
remove(@Param('id') id: number) {
  return this.sessionsService.deleteSession(id);
}

@Patch(':id')
updateStatus(
  @Param('id') id: number,
  @Body() body: { status: string }
) {
  return this.sessionsService.updateSessionStatus(id, body.status);
} 

} 
