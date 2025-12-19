import { Injectable } from '@nestjs/common';
import { Provider } from '@prisma/client';
import { EncryptionService } from '../../common/crypto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly encryptionService: EncryptionService,
  ) {}

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        provider: true,
        createdAt: true,
      },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async create(data: { email: string; password: string; name: string }) {
    return this.prisma.user.create({
      data: {
        email: data.email,
        password: data.password,
        name: data.name,
        provider: Provider.LOCAL,
      },
      select: {
        id: true,
        email: true,
        name: true,
        provider: true,
        createdAt: true,
      },
    });
  }

  async updatePushToken(userId: string, pushToken: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { pushToken },
    });
  }

  async findByNaverId(naverId: string) {
    return this.prisma.user.findUnique({
      where: { naverId },
      select: {
        id: true,
        email: true,
        name: true,
        provider: true,
        createdAt: true,
      },
    });
  }

  async createNaverUser(naverProfile: {
    id: string;
    displayName: string;
    email?: string;
    accessToken: string;
    refreshToken: string;
  }) {
    // Encrypt tokens before storing
    const encryptedAccessToken = this.encryptionService.encrypt(
      naverProfile.accessToken,
    );
    const encryptedRefreshToken = this.encryptionService.encrypt(
      naverProfile.refreshToken,
    );

    return this.prisma.user.create({
      data: {
        naverId: naverProfile.id,
        name: naverProfile.displayName,
        email: naverProfile.email,
        provider: Provider.NAVER,
        naverAccessToken: encryptedAccessToken,
        naverRefreshToken: encryptedRefreshToken,
      },
      select: {
        id: true,
        email: true,
        name: true,
        provider: true,
        createdAt: true,
      },
    });
  }

  async updateNaverTokens(
    userId: string,
    accessToken: string,
    refreshToken: string,
    profile?: { email?: string; displayName?: string },
  ) {
    // encrypt tokens before storing
    const encryptedAccessToken = this.encryptionService.encrypt(accessToken);
    const encryptedRefreshToken = this.encryptionService.encrypt(refreshToken);

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        naverAccessToken: encryptedAccessToken,
        naverRefreshToken: encryptedRefreshToken,
        // update email and name if provided and not empty
        ...(profile?.email && { email: profile.email }),
        ...(profile?.displayName && { name: profile.displayName }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        provider: true,
        createdAt: true,
      },
    });
  }

  /**
   * Get decrypted Naver tokens for a user
   * Used when making API calls to Naver services
   */
  async getNaverTokens(
    userId: string,
  ): Promise<{ accessToken: string; refreshToken: string } | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        naverAccessToken: true,
        naverRefreshToken: true,
      },
    });

    if (!user?.naverAccessToken || !user?.naverRefreshToken) {
      return null;
    }

    return {
      accessToken: this.encryptionService.decrypt(user.naverAccessToken),
      refreshToken: this.encryptionService.decrypt(user.naverRefreshToken),
    };
  }
}
