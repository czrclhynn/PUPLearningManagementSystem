# PUP Learning Management System

A learning portal prototype for Polytechnic University of the Philippines (PUP), built with React and TypeScript. The repository includes a student-facing interface, instructor and administrator dashboard screens, and an initial Fastify API service.

## Current status

The frontend uses sample data and client-side state. Sign-in is a demo flow: use the prefilled fields and click **Sign in** to explore the portal. Credentials are not authenticated, and the role selector does not enforce access control.

The API currently exposes a health endpoint only. Database persistence, real authentication, and integration between the learning features and the API are not yet implemented. Account settings and help pages are placeholders.

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

### Run the frontend

```sh
corepack pnpm dev
```

Open [http://localhost:8443](http://localhost:8443). The development server requires that port to be available; to choose another port, run `corepack pnpm dev --port 5173`.

### Run the API

In a separate terminal:

```sh
corepack pnpm dev:api
```

The API defaults to [http://127.0.0.1:3001](http://127.0.0.1:3001). Visit [the health endpoint](http://127.0.0.1:3001/health) to verify that it returns:

```json
{ "status": "ok" }
```

The frontend demo can run independently of the API. No database or environment file is required for the current local setup.

## Configuration

Set these environment variables in the shell before starting the relevant service:

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `8443` | Frontend development and preview port |
| `FIGMA_DEV_SERVER_HOST` | `0.0.0.0` | Frontend development and preview host |
| `FIGMA_PUBLIC_URL` | Unset | Optional frontend base URL for hosted builds |
| `API_HOST` | `127.0.0.1` | API bind address |
| `API_PORT` | `3001` | API port, from 1 to 65535 |

## Development commands

Run commands from the repository root using `corepack pnpm <command>`.

| Command | Description |
| --- | --- |
| `dev` | Start the frontend development server |
| `dev:api` | Start the API with file watching |
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

Playwright starts a frontend server on port `4173` automatically. End-to-end tests run separately from `check`. GitHub Actions runs both on pushes and pull requests.

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
  src/             Fastify application, configuration, routes, and tests
e2e/               Playwright browser tests
public/            Static assets
.figma/            Figma Make site configuration and supporting files
.github/workflows/ Continuous integration checks
```
