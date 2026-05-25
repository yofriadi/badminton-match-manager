import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./schema.ts",
  out: "./d1/migrations",
  dialect: "sqlite",
  strict: true,
  verbose: true,
});
