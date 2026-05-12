import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  Req,
} from '@nestjs/common';

import { AuthService } from './auth.service';

import { CreateUserDto } from '../users/dto/create-user.dto';

import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
  ) {}

  // =========================
  // REGISTER
  // =========================

  @Post('register')
  register(
    @Body() createUserDto: CreateUserDto,
  ) {
    return this.authService.register(
      createUserDto,
    );
  }

  // =========================
  // LOGIN
  // =========================

  @Post('login')
login(@Body() body: any) {
  return this.authService.login(
    body.email,
    body.password,
  );
}

  // =========================
  // CURRENT USER
  // =========================

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  getMe(@Req() req: any) {
    return req.user;
  }
}