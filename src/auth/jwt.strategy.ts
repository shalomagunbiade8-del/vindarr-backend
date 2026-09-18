import { Injectable } from '@nestjs/common';

import { PassportStrategy } from '@nestjs/passport';

import {
  ExtractJwt,
  Strategy,
} from 'passport-jwt';


@Injectable()
export class JwtStrategy
  extends PassportStrategy(Strategy) {

  constructor() {

    super({

      jwtFromRequest:
        ExtractJwt.fromAuthHeaderAsBearerToken(),

      ignoreExpiration: false,

      secretOrKey:
        process.env.JWT_SECRET,

    });

  }


  async validate(
    payload: any,
  ) {

    return {

      // =====================================
      // IMPORTANT
      // =====================================
      //
      // Make the authenticated user's database
      // ID available as req.user.id.
      //
      // payload.sub is the user ID contained
      // in the JWT.
      //
      id:
        Number(payload.sub),

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
