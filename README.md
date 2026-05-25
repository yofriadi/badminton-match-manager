# Badminton Match Manager

Single-project TanStack Start app for managing badminton halls, players, and match schedules.

## Scripts

- `bun run dev` - Start the local dev server with Cloudflare runtime enabled
- `bun run build` - Build the application
- `bun run preview` - Preview the production build
- `bun run deploy` - Build and deploy with Wrangler
- `bun run lint` - Run oxlint
- `bun run format` - Format the repository with oxfmt
- `bun run typecheck` - Run TypeScript without emitting files
- `bun run test` - Run the Vitest suite
- `bun run cf-typegen` - Regenerate Cloudflare worker types
- `bun run db:migrate` - Apply local D1 migrations
- `bun run db:migrate:remote` - Apply remote D1 migrations
- `bun run db:seed:admin` - Seed the local admin user
- `bun run db:seed:halls` - Seed the local halls data

## Project layout

- `src/app/` feature code and route-facing page components
- `src/components/` shared UI and application components
- `src/lib/` shared utilities, auth, and server helpers
- `src/hooks/` shared hooks
- `src/types/` shared type definitions
- `src/routes/`, `src/router.tsx`, and `src/server/` TanStack router and server entrypoints
- `db/` Drizzle schema, migrations, and seed scripts

## UI components

shadcn components live in `src/components/ui` and use local imports such as:

```tsx
import { Button } from "@/components/ui/button";
```
