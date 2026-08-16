# ExpenseFlow

Corporate expense reimbursement app. Node.js/Express backend, PostgreSQL via
Sequelize, server-rendered EJS views.

## Requirements

- Docker + Docker Compose

## Setup

1. Copy the example env file and fill in real values:

   ```
   cp .env.example .env
   ```

2. Build and start the stack:

   ```
   docker compose up --build
   ```

3. In a separate terminal, run migrations and seed the database:

   ```
   docker compose exec app npm run setup
   ```

4. The app is available at http://localhost:3000. A `/health` endpoint is
   available for basic liveness checks.

## Seeded accounts

All seeded users share the password `Passw0rd!`.

- Finance admin: `priya.shah@expenseflow.com`
- Managers: `david.kim@expenseflow.com` (Engineering), `sarah.ngata@expenseflow.com` (Sales)
- ~15 employees across Engineering, Sales, and Marketing

## Local (non-Docker) development

```
npm install
npm run migrate
npm run seed
npm run dev
```

Requires a local PostgreSQL instance matching the `DB_*` values in `.env`,
and `imagemagick` + `ghostscript` installed for receipt conversion.

## Project structure

```
src/
  routes/       Express route handlers
  models/       Sequelize models
  migrations/   Sequelize migrations
  seeders/      Seed data
  views/        EJS templates
  middleware/   Auth middleware
  utils/        JWT, mailer, logger, receipt conversion
```
