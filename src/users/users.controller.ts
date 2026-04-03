import { Controller, Post, Body, Get, Req, UseGuards, Patch, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @UseGuards(AuthGuard('jwt'))
@Get('me')
async getProfile(@Req() req: any) {
  return this.usersService.findOneById(req.user.userId);
} 

// temporary
@Patch('make-admin/:username')
makeAdmin(@Param('username') username: string) {
  return this.usersService.makeAdmin(username);
}


}