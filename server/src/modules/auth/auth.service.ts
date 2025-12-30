import {
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import {
  AuthResponseDto,
  LoginDto,
  NaverUserPayload,
  RefreshTokenDto,
  RegisterDto,
  TokenResponseDto,
} from './dto';
import { JwtPayload } from './interfaces';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * register user(local)
   */
  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { email, password, name } = registerDto;

    // check if user already exists
    const existingUser = await this.usersService.findByEmail(email);

    if (existingUser) {
      throw new ConflictException('[Auth] Register: User already exists');
    }

    // hash pw
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // create user
    const user = await this.usersService.create({
      email,
      password: hashedPassword,
      name,
    });

    // generate tokens
    const accessToken = this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user.id);

    return {
      accessToken,
      refreshToken,
      user,
    };
  }

  /**
   * authenticate user(local)
   */
  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    // find user by email
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('[Auth] Login: User not found');
    }

    // validate password
    const isPasswordValid = await this.validatePassword(user, password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('[Auth] Login: Invalid credentials');
    }

    // generate tokens
    const accessToken = this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user.id);

    return {
      accessToken,
      refreshToken,
      user,
    };
  }

  /**
   * refresh access token using refresh token
   * Implements token rotation: old refresh token is revoked, new one is issued
   */
  async refresh(refreshTokenDto: RefreshTokenDto): Promise<TokenResponseDto> {
    const { refreshToken } = refreshTokenDto;

    // 1. Find the refresh token in database with user
    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    // 2. Validate token exists
    if (!storedToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // 3. Check if token is revoked (potential token reuse attack)
    if (storedToken.isRevoked) {
      // Security: revoke all tokens for this user when reuse is detected
      await this.logoutAll(storedToken.userId);
      throw new UnauthorizedException('Refresh token has been revoked');
    }

    // 4. Check if token is expired
    if (new Date() > storedToken.expiresAt) {
      throw new UnauthorizedException('Refresh token has expired');
    }

    // 5. Token rotation: revoke the old token
    await this.prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { isRevoked: true },
    });

    // 6. Generate new tokens
    const user = storedToken.user;
    const newAccessToken = this.generateAccessToken({
      id: user.id,
      email: user.email ?? '',
      provider: user.provider,
    });
    const newRefreshToken = await this.generateRefreshToken(user.id);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  /**
   * logout user by revoking refresh token
   */
  async logout(refreshToken: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { token: refreshToken },
      data: { isRevoked: true },
    });
  }

  /**
   * logout user from all devices by revoking all refresh tokens
   */
  async logoutAll(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId },
      data: { isRevoked: true },
    });
  }

  /**
   * validate or create user from Naver OAuth profile
   */
  async validateNaverUser(naverPayload: NaverUserPayload): Promise<{
    id: string;
    email: string;
    name: string;
    provider: string;
  }> {
    const { accessToken, refreshToken, profile } = naverPayload;

    try {
      // Find existing user by Naver ID
      let user = await this.usersService.findByNaverId(profile.id);

      if (user) {
        // Update Naver tokens and profile for existing user
        user = await this.usersService.updateNaverTokens(
          user.id,
          accessToken,
          refreshToken,
          { email: profile.email, displayName: profile.displayName },
        );
      } else {
        // Create new user from Naver profile
        user = await this.usersService.createNaverUser({
          id: profile.id,
          displayName: profile.displayName,
          email: profile.email,
          accessToken,
          refreshToken,
        });
      }

      return {
        id: user.id,
        email: user.email ?? '',
        name: user.name,
        provider: user.provider,
      };
    } catch (error) {
      console.error('[AuthService] validateNaverUser error:', {
        message: error?.message,
        stack: error?.stack,
        profileId: profile.id,
        errorName: error?.name,
        errorCode: error?.code,
      });
      throw error;
    }
  }

  /**
   * validate user password using bcrypt comparison
   */
  private async validatePassword(
    user: { password?: string; provider?: string } | null,
    password: string,
  ): Promise<boolean> {
    if (!user || !user.password) {
      return false;
    }

    // compare password
    return bcrypt.compare(password, user.password);
  }

  /**
   * generate jwt access token
   */
  private generateAccessToken(user: {
    id: string;
    email: string;
    provider: string;
  }): string {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      provider: user.provider,
    };

    return this.jwtService.sign(payload);
  }

  /**
   * generate and store refresh token
   */
  private async generateRefreshToken(userId: string): Promise<string> {
    // generate a secure random token
    const token = crypto.randomBytes(64).toString('hex');

    // calculate expiration date (default: 30 days)
    const refreshTokenExpiresDays =
      Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS) || 30;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + refreshTokenExpiresDays);

    // store in database
    await this.prisma.refreshToken.create({
      data: {
        userId,
        token,
        expiresAt,
      },
    });

    return token;
  }

  /**
   * 클라이언트가 네이버에서 직접 받은 authorization code를 사용하여 로그인
   * 모바일 앱에서 세션 없이 OAuth를 처리할 때 사용
   */
  async naverLoginWithCode(
    code: string,
    state: string,
  ): Promise<AuthResponseDto> {
    this.logger.log('naverLoginWithCode: starting', { codeLength: code.length });

    // 1. 네이버 API로 access token 교환
    const tokenResponse = await this.exchangeNaverCode(code, state);
    this.logger.log('naverLoginWithCode: got naver tokens');

    // 2. 네이버 API로 사용자 프로필 조회
    const profile = await this.getNaverProfile(tokenResponse.access_token);
    this.logger.log('naverLoginWithCode: got profile', {
      profileId: profile.id,
      email: profile.email,
    });

    // 3. 사용자 검증 및 생성/업데이트
    const user = await this.validateNaverUser({
      accessToken: tokenResponse.access_token,
      refreshToken: tokenResponse.refresh_token,
      profile: {
        id: profile.id,
        displayName: profile.nickname || profile.name || 'Unknown',
        email: profile.email,
      },
    });

    // 4. JWT 토큰 생성
    const accessToken = this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user.id);

    return {
      accessToken,
      refreshToken,
      user,
    };
  }

  /**
   * 네이버 authorization code를 access token으로 교환
   */
  private async exchangeNaverCode(
    code: string,
    state: string,
  ): Promise<{
    access_token: string;
    refresh_token: string;
    token_type: string;
    expires_in: number;
  }> {
    const clientId = process.env.NAVER_CLIENT_ID;
    const clientSecret = process.env.NAVER_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new UnauthorizedException('Naver OAuth credentials not configured');
    }

    const tokenUrl = 'https://nid.naver.com/oauth2.0/token';
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: clientId,
      client_secret: clientSecret,
      code,
      state,
    });

    const response = await fetch(`${tokenUrl}?${params.toString()}`, {
      method: 'GET',
    });

    if (!response.ok) {
      const errorText = await response.text();
      this.logger.error('Naver token exchange failed', {
        status: response.status,
        error: errorText,
      });
      throw new UnauthorizedException('네이버 토큰 교환에 실패했습니다.');
    }

    const data = await response.json();

    if (data.error) {
      this.logger.error('Naver token exchange error', {
        error: data.error,
        errorDescription: data.error_description,
      });
      throw new UnauthorizedException(
        data.error_description || '네이버 인증에 실패했습니다.',
      );
    }

    return data;
  }

  /**
   * 네이버 access token으로 사용자 프로필 조회
   */
  private async getNaverProfile(accessToken: string): Promise<{
    id: string;
    email?: string;
    nickname?: string;
    name?: string;
    profile_image?: string;
  }> {
    const profileUrl = 'https://openapi.naver.com/v1/nid/me';

    const response = await fetch(profileUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      this.logger.error('Naver profile fetch failed', {
        status: response.status,
        error: errorText,
      });
      throw new UnauthorizedException('네이버 프로필 조회에 실패했습니다.');
    }

    const data = await response.json();

    if (data.resultcode !== '00') {
      this.logger.error('Naver profile error', {
        resultcode: data.resultcode,
        message: data.message,
      });
      throw new UnauthorizedException('네이버 프로필을 가져올 수 없습니다.');
    }

    return data.response;
  }
}
