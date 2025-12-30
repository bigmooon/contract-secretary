import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly pool: Pool;

  constructor() {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error(
        'DATABASE_URL environment variable is not set. Please check your .env file.',
      );
    }

    // Log connection string (without password) for debugging
    const maskedUrl = connectionString.replace(/:([^:@]+)@/, ':***@');
    console.log(`[PrismaService] Connecting to database: ${maskedUrl}`);

    const pool = new Pool({
      connectionString,
      // Force IPv4 if connection fails with IPv6
      // This helps on Windows where PostgreSQL might only listen on IPv4
    });
    super({ adapter: new PrismaPg(pool) });
    this.pool = pool;
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
    await this.pool.end();
  }
}
