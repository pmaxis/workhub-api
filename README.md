# WorkHub API

HTTP API for the WorkHub apps (auth, users, workspace data).

## Architecture

- **NestJS** — feature modules under `src/modules/*`, global guards (JWT, CASL/policies), throttling, DTO validation.
- **API versioning** — URI prefix `v1` (e.g. `/v1/auth/login`).
- **PostgreSQL** via **Prisma** (`prisma/schema/`).
- **`src/common/`** — config, decorators, guards, filters, utilities.
- **`src/infrastructure/`** — database, JWT/cookies, tokens.

## Environment variables

Validated with Joi (`src/common/config/validation.ts`). Example **`.env`** (test / local — replace secrets in production):

| Key | Example value | Notes |
|-----|----------------|--------|
| `PORT` | `3000` | HTTP port |
| `NODE_ENV` | `development` | Use `production` in real deploys |
| `CORS_ORIGINS` | `http://localhost:5173,http://localhost:5174,http://localhost:8081,http://localhost` | Comma-separated |
| `DATABASE_URL` | `postgresql://workhub:postgres@localhost:5432/workhub_db?schema=public` | Local dev; Docker Compose overrides this for the API service |
| `POSTGRES_USER` | `workhub` | Postgres container + compose interpolation |
| `POSTGRES_PASSWORD` | `postgres` | |
| `POSTGRES_DB` | `workhub_db` | |
| `COOKIE_SECRET` | `dev-cookie-secret-min-32-chars-long!!` | Signs cookies |
| `COOKIE_PATH` | `/api` | Must prefix browser paths to auth (e.g. `/api/v1/...`) |
| `COOKIE_SECURE` | `false` | `true` only with HTTPS |
| `ACCESS_TOKEN_SECRET` | `dev-access-token-secret-min-32-ch!!` | JWT access |
| `REFRESH_TOKEN_SECRET` | `dev-refresh-token-secret-min-32-ch!!` | JWT refresh |
| `ACCESS_TOKEN_TTL` | `15m` | Parsed with `ms` |
| `REFRESH_TOKEN_TTL` | `7d` | Parsed with `ms` |

## Run with Docker

From this directory:

```bash
docker compose up -d --build
```

- **API:** `http://localhost:3000` (or `PORT` from `.env`)
- **PostgreSQL:** `localhost:5432`
- **Adminer:** `http://localhost:8080` — server `postgres`, user/password/db from `.env`

The API service overrides `DATABASE_URL` to use the `postgres` container. Defaults include `COOKIE_PATH=/api` and `CORS_ORIGINS` with common local frontends.

Stop:

```bash
docker compose down
```
