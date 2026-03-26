import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  UseGuards,
  Req
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';
import { ProfileService } from './profile.service';

@Controller('profile')
export class ProfileController {

  constructor(private profileService: ProfileService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  getMyProfile(@Req() req) {
    return this.profileService.getMyProfile(req.user.userId);
  }

  @Get(':username')
  getProfile(@Param('username') username: string) {
    return this.profileService.getProfileByUsername(username);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch()
  updateProfile(@Req() req, @Body() body) {
    return this.profileService.updateProfile(req.user.userId, body);
  }
} 

