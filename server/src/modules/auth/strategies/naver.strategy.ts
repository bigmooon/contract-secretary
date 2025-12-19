import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-naver-v2';
import { NaverUserPayload } from '../dto';

@Injectable()
export class NaverStrategy extends PassportStrategy(Strategy, 'naver') {
  constructor() {
    super({
      clientID: process.env.NAVER_CLIENT_ID,
      clientSecret: process.env.NAVER_CLIENT_SECRET,
      callbackURL: process.env.NAVER_CALLBACK_URL,
      state: true, // enable CSRF protection via state parameter
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
  ): Promise<NaverUserPayload> {
    return {
      accessToken,
      refreshToken,
      profile: {
        id: profile.id,
        displayName: profile.nickname || profile.name || 'Unknown',
        email: profile.email,
      },
    };
  }
}
