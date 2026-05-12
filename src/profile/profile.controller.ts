import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';

import { FileInterceptor } from '@nestjs/platform-express';

import { ProfileService } from './profile.service';


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
  @UseInterceptors(
    FileInterceptor('avatar'),
  )
  updateProfile(
    @Req() req,
    @Body() body,
    @UploadedFile() avatar?: any,
  ) {

    return this.profileService.updateProfile(
      req.user.userId,
      {
        ...body,
        avatar,
      },
    );
  }
}