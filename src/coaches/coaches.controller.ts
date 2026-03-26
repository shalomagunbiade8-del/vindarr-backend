import { Controller, Get, Post, Body, Param, Patch, UseGuards, Req } from '@nestjs/common';
import { CoachesService } from './coaches.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateCoachDto } from './dto/create-coach.dto';

@Controller('coaches')
export class CoachesController {

  constructor(private readonly coachesService: CoachesService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  createCoach(
    @Body() createCoachDto: CreateCoachDto,
    @Req() req
  ) {
    const userId = req.user.userId;   // 👈 comes from JWT

    return this.coachesService.create(createCoachDto, userId);
  }
  
  @Get()
  getCoaches() {
    return this.coachesService.findAll();
  }

  @Get(':id')
getCoach(@Param('id') id: number) {
  return this.coachesService.findOne(id);
}

@Patch(':id/verify')
verifyCoach(@Param('id') id: number) {
  return this.coachesService.verifyCoach(id);
}

@Patch(':id')
updateCoach(
  @Param('id') id: number,
  @Body() body
) {
  return this.coachesService.updateCoach(id, body);
} 


@Get('user/:userId')
getCoachByUser(@Param('userId') userId: number) {
  return this.coachesService.findByUser(userId);
}

} 
