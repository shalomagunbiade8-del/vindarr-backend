import { Controller, Post, Body, Get, Req, UseGuards, Patch, Param, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import { UpdateBankDto } from './dto/update-bank.dto';


@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @UseGuards(AuthGuard('jwt'))
@Get('me')
async getProfile(@Req() req: any) {
  return this.usersService.findOneById(req.user.userId);
} 

// temporary
@UseGuards(AuthGuard('jwt'))
@Patch('make-admin/:username')
makeAdmin(@Param('username') username: string, @Req() req: any) {

  if (req.user.role !== 'admin') {
    throw new Error('Unauthorized');
  }

  return this.usersService.makeAdmin(username);
}

// bank payout related 
@UseGuards(AuthGuard('jwt'))
@Patch('bank-details')
updateBankDetails(
  @Req() req,
  @Body() dto: UpdateBankDto
) {
  return this.usersService.updateBankDetails(req.user.userId, dto);
}

@Get()
getAllUsers() {
  return this.usersService.getAllUsers();
} 

@Get('search')
searchUsers(@Query('q') query: string) {
  return this.usersService.searchUsers(query);
} 

}