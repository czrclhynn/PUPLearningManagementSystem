# PUP Learning Management System

A learning portal for Polytechnic University of the Philippines (PUP), built with React, TypeScript, Fastify, and PostgreSQL.

## Current status

Fastify authenticates users against PostgreSQL and sends each user to their assigned workspace. The administrator dashboard reads PostgreSQL counts, accounts, courses, instructor assignments, and enrollments. Account, course, and enrollment deactivation preserves academic records.

Instructors can request access from the sign-in page. Administrators review requests in **User Management**, assign approved instructors to courses, and enroll students. Instructors manage activities and review and grade text submissions. Students see enrolled courses, activity deadlines, their responses, and instructor feedback. **Academic Progress** gives administrators a read-only view of rosters, activities, submissions, and grades. Activities support optional HTTPS learning-material links.

Learning views refresh after successful writes, when their browser tab becomes visible, and every 15 seconds while visible. Calendar, planner, discussions, and announcements include preview content. Account settings and help pages are placeholders.

## Included screens

- Student dashboard, course catalog, and course details
- Activities, calendar, grades, and study planner
- Discussions, notes, and announcements
- Instructor and administrator dashboards
- Responsive navigation and light/dark themes

## Tech stack

- **Frontend:** React 19, TypeScript, Vite 8, Tailwind CSS 4, and Lucide icons
- **API:** Fastify 5 and TypeScript
- **Tooling:** pnpm workspaces, ESLint, and Oxfmt
- **Testing:** Vitest, React Testing Library, and Playwright

## Getting started

### Prerequisites

- Node.js 22 (use a current 22.x release)
- pnpm 10.34.3
- Corepack available on your PATH, since repository scripts call `corepack pnpm`

The tool versions are also declared in `.mise.toml` for developers using mise.

### Install dependencies

From the repository root:

```sh
corepack pnpm install --frozen-lockfile
```

### Configure PostgreSQL and create the first administrator

Keep the existing root `.env` if it already contains the database settings. For a new checkout, use `.env.example` as a reference. Apply the migration from the repository root:

```sh
corepack pnpm db:migrate
```

The migration checks for existing application tables and Supabase Auth users before creating the private `lms` schema. It runs in a transaction and can be rerun to check the recorded version.

For a new database, supply `LMS_ADMIN_NAME`, `LMS_ADMIN_EMAIL`, and a password of at least 12 characters as environment variables. For example, in PowerShell:

```powershell
$env:LMS_ADMIN_NAME = Read-Host "Administrator name"
$env:LMS_ADMIN_EMAIL = Read-Host "Administrator email"
$env:LMS_ADMIN_PASSWORD = Read-Host "Administrator password" -MaskInput
corepack pnpm db:bootstrap-admin
Remove-Item Env:LMS_ADMIN_PASSWORD
```

### Run the API

In one terminal:

```sh
corepack pnpm dev:api
```

The API listens on [http://127.0.0.1:3001](http://127.0.0.1:3001) by default. Use [database health](http://127.0.0.1:3001/api/health/database) to check the connection and schema. A successful Supabase check returns:

```json
{ "status": "ok", "ssl": true }
```

### Run the frontend

In a second terminal:

```sh
corepack pnpm dev --host 127.0.0.1
```

Open [http://127.0.0.1:8443](http://127.0.0.1:8443) and sign in with an existing account. Vite proxies browser requests to the API. For a different frontend port, pass `--port 5173`.

## Configuration

The API reads database variables from the root `.env`. Shell variables take precedence. Set shared frontend and API settings such as `API_PORT` in both terminals when changing their defaults.

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `8443` | Frontend development and preview port |
| `FIGMA_DEV_SERVER_HOST` | `0.0.0.0` | Frontend development and preview host |
| `FIGMA_PUBLIC_URL` | Unset | Optional frontend base URL for hosted builds |
| `API_HOST` | `127.0.0.1` | API bind address |
| `API_PORT` | `3001` | API port, from 1 to 65535 |
| `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD` | Port `5432` | Server-only PostgreSQL connection settings |
| `DB_SSLMODE` | `require` | Require TLS. Choose `verify-full` with `DB_SSLROOTCERT` to verify the server certificate and hostname |
| `DB_SSLROOTCERT` | Unset | Path to the PostgreSQL CA certificate |
| `SESSION_COOKIE_SECURE` | Enabled in production | Set to `true` on HTTPS to require a secure session cookie |

For an IPv4-only connection, use the project’s [Supabase session pooler settings](https://supabase.com/docs/guides/database/connecting-to-postgres#shared-pooler-session-mode).

## Development commands

Run commands from the repository root using `corepack pnpm <command>`.

| Command | Description |
| --- | --- |
| `dev` | Start the frontend development server |
| `dev:api` | Start the API with file watching |
| `db:migrate` | Inspect the target database and apply the LMS schema |
| `db:bootstrap-admin` | Create the first administrator using environment variables |
| `build` | Build the frontend into `dist/` |
| `build:api` | Compile the API into `apps/api/dist/` |
| `preview` | Serve the built frontend locally |
| `format` | Format the configured source and configuration files |
| `format:check` | Check formatting without changing files |
| `lint` | Lint frontend and API code |
| `typecheck` | Check frontend and API TypeScript types |
| `test` | Run unit and component tests |
| `test:e2e` | Run desktop and mobile browser tests |
| `check` | Run formatting, lint, type checks, unit tests, and both builds |

To run browser tests, install Chromium first:

```sh
corepack pnpm exec playwright install chromium
corepack pnpm test:e2e
```

By default, Playwright starts a frontend server on port `4173` and tests the student interface with a simulated sign-in response. End-to-end tests run separately from `check`. GitHub Actions runs both on pushes and pull requests.

To run the opt-in live tests, start both services locally on the default ports, supply `LMS_ADMIN_EMAIL` and `LMS_ADMIN_PASSWORD` in the test process environment, and set `LMS_LIVE_DEMO=1`. Run `corepack pnpm test:e2e e2e/learning-live.spec.ts --project=desktop` for the full academic workflow or `corepack pnpm test:e2e e2e/admin-live.spec.ts --project=desktop` for account, course, and enrollment management. These tests create identifiable sample records and deactivate active fixtures afterward, so use a development database.

To build both applications and start the compiled API:

```sh
corepack pnpm build
corepack pnpm build:api
corepack pnpm --dir apps/api start
```

Use `corepack pnpm preview` in another terminal to inspect the frontend build locally.

## Project structure

```text
src/
  app/             Navigation, header, and sidebar
  components/ui/   Shared UI components
  features/        Learning portal screens and sample data
  styles/          Shared styles, themes, and responsive layouts
  test/            Frontend test setup
  App.tsx          Application state and screen selection
  main.tsx         Frontend entry point
apps/api/
  src/             Fastify application, database, authentication, and administrator routes
  migrations/      Incremental PostgreSQL schema changes
e2e/               Playwright browser tests
public/            Static assets
.figma/            Figma Make site configuration and supporting files
.github/workflows/ Continuous integration checks
```
