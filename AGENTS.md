# Commands

- `bun run dev` - Start dev server
- `bun run build` - Build all packages
- `bun run lint` - Run ESLint (max-warnings 0)
- `bun run format` - Format code with Prettier
- `bun run typecheck` - TypeScript type checking in apps/web

# Code Style

- **Imports**: third-party → workspace (@workspace/ui, @packages/db) → relative (@/, ./)
- **Components**: PascalCase, client files start with `"use client"`, server files with `"use server"`
- **Functions**: camelCase, server actions end with `Action` suffix (e.g., `addHallToTenantAction`)
- **Hooks**: camelCase with `use` prefix (e.g., `useScheduleData`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `IDR_FORMATTER`)
- **Types**: Define interfaces in `types.ts` files, export types from `index.ts`
- **Error handling**: Throw descriptive `Error` messages, use try/catch with toast notifications
- **State**: Return objects with `{ data, isLoading, error }` for data fetching hooks
- **Structure**: Group related files by feature (components/, lib/, hooks/, types/)
