import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';

import { ProfileService } from './profile.service';

import { UpdateProfileDto } from './dto/update-profile.dto';


@Controller('profile')
export class ProfileController {

  constructor(
    private profileService: ProfileService,
  ) {}

  // =========================
  // CURRENT USER PROFILE
  // =========================
  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  getMyProfile(@Req() req) {
    return this.profileService.getMyProfile(
      req.user.userId,
    );
  }

  // =========================
  // PUBLIC PROFILE
  // =========================
  @Get(':username')
  getProfile(
    @Param('username') username: string,
  ) {
    return this.profileService.getProfileByUsername(
      username,
    );
  }

  // =========================
  // UPDATE PROFILE
  // =========================
  @UseGuards(AuthGuard('jwt'))
@Patch()
updateProfile(
  @Req() req,
  @Body() body: UpdateProfileDto,
) {
  return this.profileService.updateProfile(
    req.user.userId,
    body,
  );
}
}