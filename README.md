# WorkHub API

REST API for the WorkHub application. Built with NestJS, Prisma, and PostgreSQL. Provides authentication (JWT + refresh tokens in HTTP-only cookies), user management, and session management.

## Tech Stack

- **Runtime:** Node.js
- **Framework:** [NestJS](https://nestjs.com/) 11
- **ORM:** [Prisma](https://www.prisma.io/) 7 (PostgreSQL)
- **Auth:** JWT (access tokens) + signed HTTP-only cookies (refresh tokens), Passport, bcrypt
- **Validation:** class-validator, class-transformer
- **Security:** Helmet, Throttler, CORS
- **Config:** @nestjs/config, Joi

## Prerequisites

- Node.js (v18+)
- pnpm
- PostgreSQL

## Setup

### 1. Install dependencies

```bash
pnpm install
```

### 2. Environment variables

Create a `.env` file in the project root. Required variables:

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 3000) |
| `NODE_ENV` | `development` \| `production` |
| `CORS_ORIGINS` | Comma-separated allowed origins (e.g. `http://localhost:3000`) |
| `DATABASE_URL` | PostgreSQL connection string |
| `COOKIE_SECRET` | Secret for signing cookies |
| `COOKIE_PATH` | Path for auth cookies (e.g. `/`) |
| `ACCESS_TOKEN_SECRET` | Secret for JWT access tokens |
| `REFRESH_TOKEN_SECRET` | Secret for JWT refresh tokens |
| `ACCESS_TOKEN_TTL` | Access token lifetime (e.g. `15m`) |
| `REFRESH_TOKEN_TTL` | Refresh token lifetime (e.g. `7d`) |

### 3. Database

Generate Prisma client and run migrations:

```bash
pnpm prisma generate
pnpm prisma migrate deploy
```

For local development with migration creation:

```bash
pnpm prisma migrate dev
```

## Running the app

```bash
# Development (watch mode)
pnpm run start:dev

# Production
pnpm run build
pnpm run start:prod
```

The API listens on `http://localhost:PORT` (default 3000).

### Security

- **Rate limiting:** 100 requests per 60 seconds per IP; auth routes (login, register, refresh) are limited to 10 per 60 seconds.
- **CORS:** Only origins listed in `CORS_ORIGINS` are allowed; credentials are enabled.
- **Guards:** JWT auth is applied globally; use `@Public()` on routes that must stay unauthenticated.

## Testing

```bash
# Unit tests
pnpm run test

# Watch mode
pnpm run test:watch

# Coverage
pnpm run test:cov

# E2E tests
pnpm run test:e2e
```

## Scripts

| Script | Description |
|--------|-------------|
| `pnpm run build` | Build for production. |
| `pnpm run start` | Start (no watch). |
| `pnpm run start:dev` | Start in watch mode. |
| `pnpm run start:prod` | Run production build. |
| `pnpm run lint` | Run ESLint. |
| `pnpm run format` | Format with Prettier. |

## Project structure

- `src/app.module.ts` — Root module (throttling, config, global JWT guard).
- `src/main.ts` — Bootstrap (validation pipe, cookie parser, CORS, Helmet).
- `src/common/` — Config, guards, decorators, utilities.
- `src/infrastructure/` — Database (Prisma), tokens, cookies.
- `src/modules/` — Feature modules: `auth`, `users`, `sessions`.
- `prisma/schema/` — Prisma schema (multi-file).

## License

UNLICENSED (private).
