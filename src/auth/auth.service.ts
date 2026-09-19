import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';

import {
  UsersService,
} from '../users/users.service';

import {
  JwtService,
} from '@nestjs/jwt';

import * as bcrypt from 'bcrypt';

import {
  CreateUserDto,
} from '../users/dto/create-user.dto';

@Injectable()
export class AuthService {

  constructor(
    private readonly usersService:
      UsersService,

    private readonly jwtService:
      JwtService,
  ) {}


  // =========================================
  // REGISTER
  // =========================================

  async register(
    createUserDto: CreateUserDto,
  ) {

    const normalizedEmail =
      createUserDto.email
        .trim()
        .toLowerCase();

    const hashedPassword =
      await bcrypt.hash(
        createUserDto.password,
        10,
      );

    const user =
      await this.usersService.create({
        ...createUserDto,

        email:
          normalizedEmail,

        password:
          hashedPassword,
      });

    const {
      password,
      ...result
    } = user;

    return result;
  }


  // =========================================
  // EMAIL / PASSWORD LOGIN
  // =========================================

  async login(
    email: string,
    password: string,
  ) {

    const user =
      await this.usersService.findByEmail(
        email,
      );

    if (!user) {

      throw new UnauthorizedException(
        'Invalid credentials',
      );

    }


    // Google-only account
    if (!user.password) {

      throw new UnauthorizedException(
        'This account uses Google login. Continue with Google.',
      );

    }


    const isPasswordValid =
      await bcrypt.compare(
        password,
        user.password,
      );

    if (!isPasswordValid) {

      throw new UnauthorizedException(
        'Invalid credentials',
      );

    }


    return this.createAuthResponse(
      user,
    );
  }


  // =========================================
  // GOOGLE LOGIN / REGISTRATION
  // =========================================

  async loginWithGoogle(
    googleProfile: {
      googleId: string;
      email: string;
      avatar?: string | null;
      suggestedUsername: string;
    },
  ) {

    const email =
      googleProfile.email
        .trim()
        .toLowerCase();


    // ---------------------------------------
    // 1. Find existing Google account
    // ---------------------------------------

    let user =
      await this.usersService.findByGoogleId(
        googleProfile.googleId,
      );

    if (user) {

      return this.createAuthResponse(
        user,
      );

    }


    // ---------------------------------------
    // 2. Find existing Vindarr account
    //    using the Google email.
    // ---------------------------------------

    user =
      await this.usersService.findByEmail(
        email,
      );

    if (user) {

      // -------------------------------------
      // Existing account already linked to
      // another Google account.
      // -------------------------------------

      if (
        user.googleId &&
        user.googleId !==
          googleProfile.googleId
      ) {

        throw new ConflictException(
          'This email is already linked to another Google account.',
        );

      }


      // -------------------------------------
      // Link Google to existing account.
      // -------------------------------------

      user =
        await this.usersService
          .linkGoogleAccount(
            user.id,
            {
              googleId:
                googleProfile.googleId,

              avatar:
                googleProfile.avatar,
            },
          );

      return this.createAuthResponse(
        user,
      );
    }


    // ---------------------------------------
    // 3. Completely new Google user
    // ---------------------------------------

    user =
      await this.usersService
        .createGoogleUser({
          googleId:
            googleProfile.googleId,

          email,

          username:
            googleProfile.suggestedUsername,

          avatar:
            googleProfile.avatar,
        });


    return this.createAuthResponse(
      user,
    );
  }


  // =========================================
  // CREATE JWT RESPONSE
  // =========================================

  private createAuthResponse(
    user: any,
  ) {

    const payload = {

      sub:
        user.id,

      email:
        user.email,

      role:
        user.role,

      username:
        user.username,

    };


    return {

      access_token:
        this.jwtService.sign(
          payload,
        ),

      user: {

        id:
          user.id,

        username:
          user.username,

        email:
          user.email,

        role:
          user.role,

        avatar:
          user.avatar,

        bio:
          user.bio,

      },

    };
  }

}
