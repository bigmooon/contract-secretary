import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { config } from 'dotenv';
import { resolve } from 'path';
import { existsSync } from 'fs';
import session from 'express-session';
import { AppModule } from './app.module';

// 프로젝트 루트의 .env 파일 로드
// 우선순위:
// 1. Docker 컨테이너 내: /app/.env (docker-compose.yml에서 마운트)
// 2. 로컬 개발 (프로젝트 루트에서 실행): .env
// 3. 로컬 개발 (server 폴더에서 실행): ../.env
const possiblePaths = [
  '/app/.env', // Docker 컨테이너 내부 (절대 경로)
  resolve(process.cwd(), '.env'), // 현재 작업 디렉토리 (프로젝트 루트에서 실행)
  resolve(process.cwd(), '../.env'), // server 폴더에서 실행 시
];

let envLoaded = false;
for (const envPath of possiblePaths) {
  if (existsSync(envPath)) {
    config({ path: envPath });
    console.log(`📁 Loaded .env from: ${envPath}`);
    envLoaded = true;
    break;
  }
}

// 파일을 찾지 못한 경우 기본 dotenv 동작 (현재 디렉토리에서 찾기)
if (!envLoaded) {
  config();
  console.log(
    '⚠️  .env file not found in expected locations, using default dotenv behavior',
  );
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // session middleware for OAuth state parameter (CSRF protection)
  // Note: For mobile apps, sessions may not persist across browser redirects
  // Consider using a session store (Redis) for production
  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'default-session-secret-change-me',
      resave: false,
      saveUninitialized: true, // Allow uninitialized sessions for OAuth flow
      name: 'connect.sid', // Default session cookie name
      rolling: true, // Reset expiration on every request
      cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 10 * 60 * 1000, // 10 minutes for oauth flow
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // Allow cross-site requests in production
        // For mobile apps, domain should not be set to allow cookies across subdomains
      },
    }),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('계약비서 API')
    .setDescription('공인중개사 매물 일정 관리 앱 API 문서서')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.enableCors({
    origin: true,
    credentials: true,
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 server is running on port ${port}`);
}

bootstrap();
