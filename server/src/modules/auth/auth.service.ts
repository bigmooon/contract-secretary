import {
  ConflictException,
  Injectable,
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

    // return only safe user fields (exclude password, tokens, etc.)
    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email ?? '',
        name: user.name,
        provider: user.provider,
      },
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

    // return only safe user fields (exclude password, tokens, etc.)
    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email ?? '',
        name: user.name,
        provider: user.provider,
      },
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
  }

  /**
   * generate jwt tokens for naver oauth user
   */
  async naverLogin(naverPayload: NaverUserPayload): Promise<AuthResponseDto> {
    const user = await this.validateNaverUser(naverPayload);

    const accessToken = this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user.id);

    return {
      accessToken,
      refreshToken,
      user,
    };
  }

  /**
   * Validate Naver user and generate a short-lived authorization code for PKCE flow
   * @param naverPayload Naver user payload from OAuth callback
   * @param codeChallenge SHA256 hash of the code_verifier from client for PKCE flow
   * @returns Authorization code to be exchanged for tokens
   */
  async naverLoginWithPKCE(
    naverPayload: NaverUserPayload,
    codeChallenge: string,
  ): Promise<string> {
    const user = await this.validateNaverUser(naverPayload);
    return this.generateAuthorizationCode(user.id, codeChallenge);
  }

  /**
   * Exchange authorization code for JWT tokens (PKCE flow)
   * @param code Authorization code from OAuth callback
   * @param codeVerifier Original code_verifier from client
   * @returns JWT access and refresh tokens
   */
  async exchangeCodeForTokens(
    code: string,
    codeVerifier: string,
  ): Promise<AuthResponseDto> {
    // 1. Find the authorization code
    const authCode = await this.prisma.authorizationCode.findUnique({
      where: { code },
      include: { user: true },
    });

    // 2. Validate code exists
    if (!authCode) {
      throw new UnauthorizedException('Invalid authorization code');
    }

    // 3. Check if code is already used (replay attack prevention)
    if (authCode.isUsed) {
      // Security: revoke all tokens for this user when code reuse is detected
      await this.logoutAll(authCode.userId);
      throw new UnauthorizedException(
        'Authorization code has already been used',
      );
    }

    // 4. Check if code is expired
    if (new Date() > authCode.expiresAt) {
      throw new UnauthorizedException('Authorization code has expired');
    }

    // 5. Verify PKCE: SHA256(code_verifier) must match stored code_challenge
    const computedChallenge = this.computeCodeChallenge(codeVerifier);
    if (computedChallenge !== authCode.codeChallenge) {
      throw new UnauthorizedException('Invalid code_verifier');
    }

    // 6. Mark code as used
    await this.prisma.authorizationCode.update({
      where: { id: authCode.id },
      data: { isUsed: true },
    });

    // 7. Generate JWT tokens
    const user = authCode.user;
    const accessToken = this.generateAccessToken({
      id: user.id,
      email: user.email ?? '',
      provider: user.provider,
    });
    const refreshToken = await this.generateRefreshToken(user.id);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email ?? '',
        name: user.name,
        provider: user.provider,
      },
    };
  }

  /**
   * Generate a short-lived authorization code for PKCE flow
   */
  private async generateAuthorizationCode(
    userId: string,
    codeChallenge: string,
  ): Promise<string> {
    // Generate a secure random code
    const code = crypto.randomBytes(32).toString('hex');

    // Short expiration: 5 minutes
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5);

    // Store in database
    await this.prisma.authorizationCode.create({
      data: {
        userId,
        code,
        codeChallenge,
        expiresAt,
      },
    });

    return code;
  }

  /**
   * Compute SHA256 hash of code_verifier for PKCE verification
   * Uses S256 method as per RFC 7636
   */
  private computeCodeChallenge(codeVerifier: string): string {
    return crypto.createHash('sha256').update(codeVerifier).digest('base64url');
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
   * clean up expired authorization codes (can be called periodically)
   */
  async cleanupExpiredAuthCodes(): Promise<number> {
    const result = await this.prisma.authorizationCode.deleteMany({
      where: {
        OR: [{ expiresAt: { lt: new Date() } }, { isUsed: true }],
      },
    });
    return result.count;
  }
}
