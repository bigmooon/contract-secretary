# Contract Secretary - Backend API

계약서 관리 시스템을 위한 Nest.js 백엔드 API입니다.

## 기술 스택

- **Framework**: Nest.js 10
- **Language**: TypeScript
- **Runtime**: Node.js

## 시작하기

### 의존성 설치

```bash
# 루트 디렉토리에서 실행
pnpm install
```

### 개발 서버 실행

```bash
# 루트 디렉토리에서 실행
pnpm server:dev

# 또는 server 디렉토리에서 직접 실행
cd server
pnpm start:dev
```

서버는 기본적으로 `http://localhost:3000`에서 실행됩니다.

### 빌드

```bash
# 루트 디렉토리에서 실행
pnpm server:build

# 또는 server 디렉토리에서 직접 실행
cd server
pnpm build
```

### 프로덕션 실행

```bash
pnpm server:start

# 또는
cd server
pnpm start:prod
```

## API 엔드포인트

### Health Check

```
GET /health
```

서버 상태를 확인합니다.

**응답 예시:**
```json
{
  "status": "ok",
  "timestamp": "2024-12-04T10:00:00.000Z",
  "service": "contract-secretary-api"
}
```

## 프로젝트 구조

```
server/
├── src/
│   ├── main.ts           # 애플리케이션 엔트리 포인트
│   ├── app.module.ts     # 루트 모듈
│   ├── app.controller.ts # 기본 컨트롤러
│   └── app.service.ts    # 기본 서비스
├── dist/                 # 빌드 출력 (자동 생성)
├── node_modules/         # 의존성 (자동 생성)
├── nest-cli.json         # Nest CLI 설정
├── package.json          # 프로젝트 메타데이터 및 의존성
├── tsconfig.json         # TypeScript 설정
└── README.md            # 프로젝트 문서
```

## 개발 가이드

### 새로운 모듈 생성

```bash
nest generate module [모듈명]
nest generate controller [컨트롤러명]
nest generate service [서비스명]
```

### 코드 린팅

```bash
pnpm lint
```

### 코드 포매팅

```bash
pnpm format
```

## 환경 변수

`.env.example` 파일을 `.env`로 복사하고 필요한 값을 설정하세요.

```bash
cp .env.example .env
```

## 다음 단계

- [ ] 데이터베이스 연동 (TypeORM 또는 Prisma)
- [ ] 인증/인가 시스템 구현 (JWT)
- [ ] 계약서 CRUD API 구현
- [ ] 파일 업로드 기능
- [ ] API 문서화 (Swagger)

