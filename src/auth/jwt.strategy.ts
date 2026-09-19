import {
Injectable,
} from '@nestjs/common';

import {
PassportStrategy,
} from '@nestjs/passport';

import {
ExtractJwt,
Strategy,
} from 'passport-jwt';

import {
ConfigService,
} from '@nestjs/config';

@Injectable()
export class JwtStrategy
extends PassportStrategy(
Strategy,
) {

constructor(
private readonly configService:
ConfigService,
) {


super({

  jwtFromRequest:
    ExtractJwt.fromAuthHeaderAsBearerToken(),

  ignoreExpiration: false,

  secretOrKey:
    configService.getOrThrow<string>(
      'JWT_SECRET',
    ),

});


}

async validate(
payload: any,
) {


return {

  // User ID from JWT subject.
  id:
    Number(payload.sub),

  // Kept for compatibility with
  // existing Vindarr code.
  userId:
    Number(payload.sub),

  email:
    payload.email,

  role:
    payload.role,

  username:
    payload.username,

};


}

}
