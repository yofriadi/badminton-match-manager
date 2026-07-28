# Badminton Match Manager

Single-project TanStack Start app for managing badminton halls, players, and match schedules on Cloudflare Workers + D1.

## Stack

- TanStack Start / TanStack Router
- React 19
- Vite 8 + `@cloudflare/vite-plugin`
- Cloudflare Workers, D1, and Wrangler
- Better Auth
- Drizzle ORM
- Tailwind CSS v4
- Vitest, Oxlint, and Oxfmt

## Prerequisites

- Node.js 22+
- pnpm 9+
- Cloudflare account credentials for remote D1 / deploy workflows

## Environment

Local Worker secrets live in `.dev.vars` (not committed with real production values):

```bash
BETTER_AUTH_URL=http://localhost:3000
```

Optional:

- `D1_DATABASE_NAME` — defaults to `badminton` for migrate/seed helpers
- `VITE_BETTER_AUTH_URL` — only if the auth client must target a non-same-origin base URL
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` — required by the admin seeder

After changing Wrangler bindings or secrets that affect types, run:

```bash
pnpm cf-typegen
```

## Scripts

- `pnpm dev` — local Vite dev server with the Cloudflare Workers runtime
- `pnpm build` — production build
- `pnpm preview` — preview the production build locally
- `pnpm deploy` — build and deploy with Wrangler
- `pnpm lint` — oxlint
- `pnpm format` — format with oxfmt
- `pnpm typecheck` — TypeScript (`tsc --noEmit`)
- `pnpm test` — Vitest suite
- `pnpm cf-typegen` — regenerate Cloudflare worker types from `wrangler.jsonc`
- `pnpm db:migrate` — apply local D1 migrations
- `pnpm db:migrate:remote` — apply remote D1 migrations
- `pnpm db:seed:admin` — seed the local admin user
- `pnpm db:seed:halls` — seed local halls data
- `pnpm db:seed:courts` — seed local courts data

## Project layout

- `src/app/` feature code and route-facing page components
- `src/components/` shared UI and application components
- `src/lib/` shared utilities, auth, and server helpers
- `src/hooks/` shared hooks
- `src/types/` shared type definitions
- `src/routes/`, `src/router.tsx`, and `src/server/` TanStack Router and Start server entrypoints
- `db/` Drizzle schema, migrations, and seed scripts

## UI components

shadcn components live in `src/components/ui` and use local imports such as:

```tsx
import { Button } from "@/components/ui/button";
```

## Local development

1. `pnpm install`
2. Ensure `.dev.vars` has `BETTER_AUTH_URL`
3. `pnpm db:migrate`
4. Optionally run `pnpm db:seed:*`
5. `pnpm dev`
