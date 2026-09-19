import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Req,
  Res,
} from '@nestjs/common';

import {
  Response,
} from 'express';

import {
  AuthService,
} from './auth.service';

import {
  CreateUserDto,
} from '../users/dto/create-user.dto';

import {
  AuthGuard,
} from '@nestjs/passport';

import {
  LoginDto,
} from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  // =========================================
  // REGISTER
  // =========================================

  @Post('register')
  register(
    @Body()
    createUserDto: CreateUserDto,
  ) {
    return this.authService.register(
      createUserDto,
    );
  }

  // =========================================
  // EMAIL/PASSWORD LOGIN
  // =========================================

  @Post('login')
  login(
    @Body()
    loginDto: LoginDto,
  ) {
    return this.authService.login(
      loginDto.email,
      loginDto.password,
    );
  }

  // =========================================
  // START GOOGLE LOGIN
  // =========================================

  @Get('google')
  @UseGuards(
    AuthGuard('google'),
  )
  googleLogin() {
    // Passport redirects the user to Google.
  }

  // =========================================
  // GOOGLE CALLBACK
  // =========================================

  @Get('google/callback')
  @UseGuards(
    AuthGuard('google'),
  )
  async googleCallback(
    @Req() req: any,
    @Res() res: Response,
  ) {
    const frontendUrl = (
      process.env.FRONTEND_URL ||
      'http://localhost:5500'
    ).replace(/\/+$/, '');

    try {
      const result =
        await this.authService.loginWithGoogle(
          req.user,
        );

      const redirectUrl =
        `${frontendUrl}/google-callback.html` +
        `#token=${encodeURIComponent(
          result.access_token,
        )}`;

      return res.redirect(
        redirectUrl,
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Google authentication failed';

      return res.redirect(
        `${frontendUrl}/login.html` +
        `?googleError=${encodeURIComponent(
          message,
        )}`,
      );
    }
  }

  // =========================================
  // CURRENT USER
  // =========================================

  @UseGuards(
    AuthGuard('jwt'),
  )
  @Get('me')
  getMe(
    @Req() req: any,
  ) {
    return req.user;
  }
}
