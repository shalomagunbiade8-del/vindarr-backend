import { Controller, Post, Get, Body, Param, Patch } from '@nestjs/common';
import { SessionsService } from './sessions.service'; 
import { Delete } from '@nestjs/common';
import { Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

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

@UseGuards(AuthGuard('jwt'))
@Patch(':id')
updateStatus(
  @Param('id') id: number,
  @Body() body: { status: string },
  @Req() req
) {
  return this.sessionsService.updateSessionStatus(
    id,
    body.status,
    req.user.userId
  );
} 

// bank payout related
@Get('admin/payouts')
getPayouts() {
  return this.sessionsService.getCoachPayoutSummary();
} 

@Post('admin/payouts/mark-paid')
markPaid(@Body() body: { sessionIds: number[] }) {
  return this.sessionsService.markAsPaid(body.sessionIds);
} 


} 
