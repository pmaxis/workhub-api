# WorkHub API

REST API for the WorkHub application. Built with NestJS, Prisma, and PostgreSQL. Provides authentication (JWT + refresh tokens in HTTP-only cookies), user management, roles, permissions, and session management.

## Tech Stack

- **Runtime:** Node.js 20+
- **Framework:** [NestJS](https://nestjs.com/) 11
- **ORM:** [Prisma](https://www.prisma.io/) 7 (PostgreSQL)
- **Auth:** JWT (access tokens) + signed HTTP-only cookies (refresh tokens), Passport, bcrypt
- **Validation:** class-validator, class-transformer
- **Security:** Helmet, Throttler, CORS
- **Config:** @nestjs/config, Joi

## Prerequisites

- Node.js 20+
- pnpm 10+
- PostgreSQL

## Setup

### 1. Install dependencies

```bash
pnpm install
```

### 2. Environment variables

Create a `.env` file in the project root. Required variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment | `development` or `production` |
| `CORS_ORIGINS` | Comma-separated allowed origins | `http://localhost:5173,http://localhost:5174` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/db_name?schema=public` |
| `POSTGRES_USER` | PostgreSQL user (for Docker) | `username` |
| `POSTGRES_PASSWORD` | PostgreSQL password (for Docker) | `password` |
| `POSTGRES_DB` | PostgreSQL database name (for Docker) | `db_name` |
| `COOKIE_SECRET` | Secret for signing cookies | `your-secret` |
| `COOKIE_PATH` | Path for auth cookies. Use `/api/auth/refresh` when frontend proxies via `/api` | `/auth/refresh` or `/api/auth/refresh` |
| `COOKIE_SECURE` | Set to `true` only over HTTPS | `false` |
| `ACCESS_TOKEN_SECRET` | Secret for JWT access tokens | `your-secret` |
| `REFRESH_TOKEN_SECRET` | Secret for JWT refresh tokens | `your-secret` |
| `ACCESS_TOKEN_TTL` | Access token lifetime | `15m` |
| `REFRESH_TOKEN_TTL` | Refresh token lifetime | `7d` |

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

### 4. Seed (optional)

Creates admin user (`admin@test.com` / `password`), admin role, and `manage.all` permission:

```bash
pnpm build
pnpm seed
```

## Running the app

```bash
# Development (watch mode)
pnpm start:dev

# Production
pnpm build
pnpm start:prod
```

The API listens on `http://localhost:PORT` (default 3000).

## Docker

The project includes a separate `docker-compose.yml` for API + PostgreSQL + Adminer.

```bash
docker compose up -d
```

- **API:** http://localhost:3000
- **PostgreSQL:** localhost:5432
- **Adminer** (DB admin UI): http://localhost:8080 — System: PostgreSQL, Server: postgres, credentials from `.env`

For Docker with nginx proxy (frontend at `/api`), set `COOKIE_PATH=/api/auth/refresh` and `COOKIE_SECURE=false` in `.env`.

Run seed manually in Docker:

```bash
docker compose exec workhub-api node dist/prisma/seeds/seed.js
```

## Security

- **Rate limiting:** 100 requests per 60 seconds per IP; auth routes (login, register, refresh) are limited to 10 per 60 seconds.
- **CORS:** Only origins listed in `CORS_ORIGINS` are allowed; credentials are enabled.
- **Guards:** JWT auth is applied globally; use `@Public()` on routes that must stay unauthenticated.

## Testing

```bash
# Unit tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage
pnpm test:cov

# E2E tests
pnpm test:e2e
```

## Scripts

| Script | Description |
|--------|-------------|
| `pnpm build` | Build for production (includes seed compilation). |
| `pnpm seed` | Run database seed (requires build first). |
| `pnpm start` | Start (no watch). |
| `pnpm start:dev` | Start in watch mode. |
| `pnpm start:prod` | Run production build. |
| `pnpm lint` | Run ESLint. |
| `pnpm format` | Format with Prettier. |

## Project structure

- `src/app.module.ts` — Root module (throttling, config, global JWT guard).
- `src/main.ts` — Bootstrap (validation pipe, cookie parser, CORS, Helmet).
- `src/common/` — Config, guards, decorators, utilities.
- `src/infrastructure/` — Database (Prisma), tokens, cookies.
- `src/modules/` — Feature modules: `auth`, `users`, `roles`, `permissions`, `sessions`.
- `prisma/schema/` — Prisma schema (multi-file).
- `prisma/seeds/` — Database seed scripts.

## License

UNLICENSED (private).
