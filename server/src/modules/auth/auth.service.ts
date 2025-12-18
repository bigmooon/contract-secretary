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
    // Generate a secure random token
    const token = crypto.randomBytes(64).toString('hex');

    // Calculate expiration date (default: 30 days)
    const refreshTokenExpiresDays =
      Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS) || 30;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + refreshTokenExpiresDays);

    // Store in database
    await this.prisma.refreshToken.create({
      data: {
        userId,
        token,
        expiresAt,
      },
    });

    return token;
  }
}
