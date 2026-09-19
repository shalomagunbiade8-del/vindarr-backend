import {
Module,
} from '@nestjs/common';

import {
AuthService,
} from './auth.service';

import {
AuthController,
} from './auth.controller';

import {
UsersModule,
} from '../users/users.module';

import {
JwtModule,
} from '@nestjs/jwt';

import {
JwtStrategy,
} from './jwt.strategy';

import {
GoogleStrategy,
} from './google.strategy';

import {
PassportModule,
} from '@nestjs/passport';

import {
ConfigService,
} from '@nestjs/config';

@Module({
imports: [
PassportModule.register({
defaultStrategy: 'jwt',
}),


JwtModule.registerAsync({
  inject: [
    ConfigService,
  ],

  useFactory:
    (
      configService:
        ConfigService,
    ) => ({
      secret:
        configService.getOrThrow<string>(
          'JWT_SECRET',
        ),

      signOptions: {
        expiresIn: '1h',
      },
    }),
}),

UsersModule,


],

providers: [
AuthService,
JwtStrategy,
GoogleStrategy,
],

controllers: [
AuthController,
],

exports: [
AuthService,
],
})
export class AuthModule {}
