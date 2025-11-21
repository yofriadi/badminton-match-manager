# Database Setup

This project uses Prisma with SQLite for data persistence.

## Overview

All hardcoded data has been moved to database fetches. The application now uses:
- **Prisma** as the ORM
- **SQLite** as the database (via libsql adapter)
- Database file located at `apps/web/prisma/dev.db`

## Schema

The database schema is defined in `apps/web/prisma/schema.prisma`.

Current models:
- **PageContent**: Stores page content including title, button text, and button size

## Commands

Run these commands from the `apps/web` directory:

```bash
# Generate Prisma client after schema changes
pnpm db:generate

# Create and run a new migration
pnpm db:migrate

# Seed the database with initial data
pnpm db:seed
```

## Development Workflow

1. **First time setup**: The database and Prisma client are automatically set up when you install dependencies (via postinstall script)

2. **Seeding**: Run `pnpm db:seed` to populate the database with initial content

3. **Schema changes**:
   - Edit `prisma/schema.prisma`
   - Run `pnpm db:migrate` to create and apply a migration
   - Prisma client is regenerated automatically

4. **Using Prisma in code**:
   ```typescript
   import { prisma } from "@/lib/prisma"
   
   const content = await prisma.pageContent.findFirst()
   ```

## Database Location

- Development: `apps/web/prisma/dev.db` (gitignored)
- The database file is excluded from version control

## Prisma Client

The Prisma client is generated to `node_modules/@prisma/client` and uses the libsql adapter for SQLite connections. The singleton instance is available from `apps/web/lib/prisma.ts`.
