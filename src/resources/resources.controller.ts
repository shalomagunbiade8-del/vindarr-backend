import { Controller,Post, Get, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ResourcesService } from './resources.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('resources')
export class ResourcesController {

  constructor(private resourcesService: ResourcesService) {}

  @UseGuards(AuthGuard('jwt'))
@Post()
create(@Body() body, @Req() req) {

  const coachId = body.coachId;

  return this.resourcesService.create({
    ...body,
    coachId
  });

} 

  @Get()
  getAll() {
    return this.resourcesService.findAll();
  }

  @Get(':coachId')
getCoachResources(@Param('coachId') coachId: number) {
  return this.resourcesService.findByCoach(coachId);
} 

}








