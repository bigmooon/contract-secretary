# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

계약비서 (Contract Secretary) — an app for Korean real estate agents (공인중개사) to import a CSV/Excel of their managed properties and see all contract renewal/expiration dates in one place. Target users are non-technical, so the client UX must stay simple and direct. pnpm monorepo: `server/` (NestJS API) + `client/` (Expo React Native app, iOS/Android/Web).

## Commands

Run these from the repo root (they delegate to the workspaces via `pnpm --filter`):

```bash
# DB (must be up before the server) — Postgres in Docker
pnpm docker:up            # start postgres (+ server) via docker-compose
pnpm docker:down
pnpm docker:logs

# Prisma
pnpm prisma:generate      # regenerate client after schema.prisma changes
pnpm prisma:migrate:dev   # create + apply a dev migration
pnpm prisma:studio

# Server (NestJS)
pnpm server:dev           # nest start --watch, port 3000, Swagger at /api
pnpm server:build

# Client (Expo)
pnpm client:start         # expo start
pnpm client:start:clear   # clear Metro cache (use when bundler acts stale)
pnpm client:start:tunnel  # test on a physical device off-LAN
pnpm client:android | client:ios | client:web
```

Lint/format live in each workspace: `pnpm --filter server lint` (eslint --fix), `pnpm --filter server format` (prettier), `pnpm --filter client lint` (expo lint). There are no tests yet — no test runner is configured despite the global TDD rules.

`.env` lives at the repo root (not in `server/`). `server/src/main.ts` searches `/app/.env` → `<cwd>/.env` → `../.env`, so run the server from the root or ensure the root `.env` is reachable. See `.env.example`.

## Architecture

### Server (`server/src/`)
Standard NestJS feature-module layout. Each module under `modules/<name>/` owns its `*.controller.ts`, `*.service.ts`, `*.module.ts`, and a `dto/` folder (class-validator DTOs, barrel-exported via `dto/index.ts`). Modules: `auth`, `users`, `properties`, `contracts`, `csv`. Cross-cutting: `prisma/` (PrismaService), `common/crypto/` (EncryptionService for Naver token encryption), `config/` (env/jwt/swagger/database).

- **Data model** (`prisma/schema.prisma`, Postgres): `User` → `Property` → `Contract` → (`Alert`, `Stakeholder`, `NaverCalendarEvent`). Also `CsvImportLog`, `RefreshToken`, `AuthorizationCode`. All FKs cascade-delete. Money fields (`depositPrice`, `monthlyRent`) are `BigInt` — serialize carefully across the API/JSON boundary. Dates are `@db.Date` (no time). DB column names are snake_case via `@map`.
- **Auth**: JWT (access + rotating refresh tokens stored in `RefreshToken`) plus Naver OAuth. Mobile login uses a **PKCE** flow (`AuthorizationCode` model, `code_challenge` = SHA256 of verifier) rather than the browser redirect. Endpoints opt out of the JWT guard with the `@Public()` decorator. Naver access/refresh tokens are encrypted at rest.
- **Global setup** (`main.ts`): `ValidationPipe` with `whitelist` + `forbidNonWhitelisted` + `transform` (unknown body fields are rejected — keep DTOs complete). `express-session` exists only for the OAuth state/CSRF param; it is in-memory (swap for Redis in prod). CORS is `origin: true, credentials: true`. Swagger UI at `/api`.
- **CSV/Excel** (`modules/csv/`): the core feature. Parses `.csv` (papaparse) and `.xlsx` (xlsx) uploads into properties+contracts+stakeholders, records a `CsvImportLog`, and supports export. Owner/tenant contacts arrive as delimited strings and become `Stakeholder` rows.

### Client (`client/`)
Expo Router (file-based routing) + Zustand + axios. Path alias `@/*` → repo `client/` root.

- **Routing** (`app/`): route groups `(auth)` (login) and `(tabs)` (index/home, list, settings); `property/[id]`, `property/add`, `property/edit/[id]`; `auth/callback` handles the OAuth redirect. `_layout.tsx` files set up navigators, theme, and fonts.
- **Feature modules** (`modules/<name>/`): each has `hooks/`, `services/`, `stores/` (Zustand), `types/`, barrel-exported via `index.ts`. Modules: `auth`, `contracts`, `properties`, `common`. Screens in `app/` stay thin and consume these modules.
- **API layer** (`modules/common/api/`): `base.api.ts` is a single axios instance with interceptors — injects the Bearer token (skipping `PUBLIC_ENDPOINTS`), and on a 401 refreshes the token once, **queuing** concurrent failed requests until the refresh resolves, then retries them. On refresh failure it clears tokens (`expo-secure-store`) and fires the `onUnauthorized` callback. All endpoints are declared in `config/api.config.ts`, which auto-detects the API base URL from the Expo debugger host (falls back to `10.0.2.2` on Android emulator, `localhost` on web) — usually no manual config needed on LAN.
- **Design system** (`design-system/`): tokens (colors/typography/spacing/shadows) → theme (`useTheme`, `useThemeColor`) → components (`Text` with `variant`, `View`). Import from `@/design-system`. Use tokens and text `variant`s, not hardcoded style values; use semantic color names (`theme.colors.error`, not raw palette). Font is Pretendard. See `design-system/README.md`.

## Conventions

- Files/dirs are kebab-case; organized by feature/domain, not by type. Keep files focused (see the global coding-style rules).
- Server DTOs drive validation — because of `forbidNonWhitelisted`, every accepted field must be declared with a class-validator decorator or the request 400s.
- When touching `schema.prisma`, run `pnpm prisma:generate` (and a migration for schema changes) before the server will typecheck against the new model.
