# Commands
- `bun run dev` - Start dev server
- `bun run build` - Build the app
- `bun run lint` - Run oxlint (deny warnings)
- `bun run format` - Format code with oxfmt
- `bun run typecheck` - TypeScript type checking
- `bun run test` - Run Vitest

# Code Style
- **Imports**: third-party → local alias (`@/`) → relative (`./`)
- **Components**: PascalCase, client files start with `"use client"`, server files with `"use server"`
- **Functions**: camelCase, server actions end with `Action` suffix (e.g., `addHallToTenantAction`)
- **Hooks**: camelCase with `use` prefix (e.g., `useScheduleData`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `IDR_FORMATTER`)
- **Types**: Define interfaces in `types.ts` files, export types from `index.ts`
- **Error handling**: Throw descriptive `Error` messages, use try/catch with toast notifications
- **State**: Return objects with `{ data, isLoading, error }` for data fetching hooks
- **Structure**: Group related files under `src/` by feature (`src/app/`, `src/components/`, `src/lib/`, `src/hooks/`, `src/types/`) while keeping database code in root `db/`
