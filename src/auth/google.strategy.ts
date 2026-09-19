import {
Injectable,
UnauthorizedException,
} from '@nestjs/common';

import {
PassportStrategy,
} from '@nestjs/passport';

import {
Strategy,
Profile,
VerifyCallback,
} from 'passport-google-oauth20';

import {
ConfigService,
} from '@nestjs/config';

@Injectable()
export class GoogleStrategy
extends PassportStrategy(
Strategy,
'google',
) {
constructor(
private readonly configService:
ConfigService,
) {
super({
clientID:
configService.getOrThrow<string>(
'GOOGLE_CLIENT_ID',
),


  clientSecret:
    configService.getOrThrow<string>(
      'GOOGLE_CLIENT_SECRET',
    ),

  callbackURL:
    configService.getOrThrow<string>(
      'GOOGLE_CALLBACK_URL',
    ),

  scope: [
    'profile',
    'email',
  ],
});


}

async validate(
accessToken: string,
refreshToken: string,
profile: Profile,
done: VerifyCallback,
) {
try {
const email =
profile.emails?.[0]?.value
?.trim()
.toLowerCase();


  const googleId =
    profile.id;

  const avatar =
    profile.photos?.[0]?.value ||
    null;

  const firstName =
    profile.name?.givenName ||
    '';

  const lastName =
    profile.name?.familyName ||
    '';

  const suggestedUsername =
    `${firstName}${lastName}`
      .trim()
      .toLowerCase()
      .replace(
        /[^a-z0-9_]/g,
        '',
      );

  const emailVerified =
    Boolean(
      (profile as any)?._json
        ?.email_verified,
    );

  if (!googleId) {
    throw new UnauthorizedException(
      'Google account ID was not provided.',
    );
  }

  if (!email) {
    throw new UnauthorizedException(
      'Google email was not provided.',
    );
  }

  if (!emailVerified) {
    throw new UnauthorizedException(
      'Your Google email must be verified.',
    );
  }

  return done(
    null,
    {
      googleId,
      email,
      avatar,
      suggestedUsername:
        suggestedUsername ||
        email.split('@')[0],
    },
  );
} catch (error) {
  return done(
    error,
    false,
  );
}


}
}
