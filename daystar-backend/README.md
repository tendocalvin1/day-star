# DayStar Backend

DayStar is a Node.js, Express, PostgreSQL, and Knex backend for a daycare management SaaS platform. The backend is structured as a modular monolith with clear route, controller, service, and model boundaries.

## Dockerized Local Runtime

From the repository root:

```bash
docker compose up --build
```

This starts:

- `api`: the Express backend on `http://localhost:5000`
- `postgres`: PostgreSQL 16 with a persistent Docker volume

The API waits for PostgreSQL to become healthy, runs Knex migrations, then starts the server. This keeps local setup reproducible while still exercising the same migration path used in production-style environments.

Useful endpoints:

```text
GET http://localhost:5000/health
GET http://localhost:5000/api/docs
```

To stop containers while keeping database data:

```bash
docker compose down
```

To fully reset the local Docker database:

```bash
docker compose down -v
```

## Environment Configuration

Local Docker defaults are defined in the root `docker-compose.yml`. For production deployments, provide real environment variables through the host platform secret manager.

Important variables:

```text
NODE_ENV=production
PORT=5000
DATABASE_URL=postgres://user:password@host:5432/database
DB_SSL=true
JWT_SECRET=<long-random-secret>
JWT_ACCESS_EXPIRES_IN=15m
FRONTEND_URL=https://your-frontend-domain.com
```

Use `DB_SSL=true` for hosted databases that require TLS. Local Docker Compose sets `DB_SSL=false` because the API and Postgres containers communicate on a private Docker network.

## Migrations

Knex migrations are the source of truth for database schema changes.

```bash
npm run migrate
```

In local Docker Compose, migrations run during API startup for convenience. In production, prefer running migrations as an explicit release step before starting new app instances.

## CI Pipeline

Backend CI lives at:

```text
.github/workflows/backend-ci.yml
```

The workflow:

- checks out the repository
- installs dependencies with `npm ci`
- starts a PostgreSQL service container
- runs Knex migrations
- seeds the test database
- runs Jest/Supertest integration tests

This verifies that the backend works against a real PostgreSQL database and that migrations remain executable in a clean environment.

## Local Non-Docker Commands

From `daystar-backend/`:

```bash
npm ci
npm run migrate
npm run seed
npm test
```

## Production Notes

- Keep the app as a modular monolith until product scale justifies more infrastructure.
- Do not commit real `.env` files or secrets.
- Run migrations before app rollout in production.
- Use `/health` for platform health checks.
- Keep logs structured and avoid logging passwords, tokens, or sensitive child/family data.
