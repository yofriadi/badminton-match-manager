-- Up Migration: consolidated auth tables for BetterAuth (email/password)

-- users table
CREATE TABLE IF NOT EXISTS "users" (
  "id" uuid PRIMARY KEY DEFAULT uuidv7(),
  "email" text NOT NULL UNIQUE,
  "name" text NOT NULL,
  "email_verified" boolean NOT NULL DEFAULT false,
  "role" text NOT NULL DEFAULT 'user',
  "password" text,
  "created_at" timestamptz NOT NULL DEFAULT NOW(),
  "updated_at" timestamptz NOT NULL DEFAULT NOW()
);
CREATE TRIGGER users_set_updated
BEFORE UPDATE ON "users" FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- session table (required by BetterAuth even when cookie strategy is used)
CREATE TABLE IF NOT EXISTS "sessions" (
  "id" uuid PRIMARY KEY DEFAULT uuidv7(),
  "expires_at" timestamptz NOT NULL,
  "token" text NOT NULL UNIQUE,
  "created_at" timestamptz NOT NULL DEFAULT NOW(),
  "updated_at" timestamptz NOT NULL DEFAULT NOW(),
  "ip_address" text,
  "user_agent" text,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE
);
CREATE TRIGGER sessions_set_updated
BEFORE UPDATE ON "sessions" FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- account table (minimal, for completeness; used by BetterAuth even without social login)
CREATE TABLE IF NOT EXISTS "accounts" (
  "id" uuid PRIMARY KEY DEFAULT uuidv7(),
  "account_id" text NOT NULL,
  "provider_id" text NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "access_token" text,
  "refresh_token" text,
  "id_token" text,
  "access_token_expires_at" timestamptz,
  "refresh_token_expires_at" timestamptz,
  "scope" text,
  "password" text,
  "created_at" timestamptz NOT NULL DEFAULT NOW(),
  "updated_at" timestamptz NOT NULL DEFAULT NOW(),
  UNIQUE ("provider_id", "account_id")
);
CREATE TRIGGER accounts_set_updated
BEFORE UPDATE ON "accounts" FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- verification table (needed for password reset / email verify)
CREATE TABLE IF NOT EXISTS "verifications" (
  "id" uuid PRIMARY KEY DEFAULT uuidv7(),
  "identifier" text NOT NULL,
  "value" text NOT NULL,
  "expires_at" timestamptz NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT NOW(),
  "updated_at" timestamptz NOT NULL DEFAULT NOW(),
  UNIQUE ("identifier", "value")
);
CREATE TRIGGER verifications_set_updated
BEFORE UPDATE ON "verifications" FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Link tenants to users
ALTER TABLE IF EXISTS "tenants"
  ADD CONSTRAINT "tenants_user_id_fkey" 
  FOREIGN KEY ("user_id") 
  REFERENCES "users"("id") 
  ON DELETE SET NULL;

-- Down Migration (drop in reverse order)
ALTER TABLE IF EXISTS "tenants" DROP CONSTRAINT IF EXISTS "tenants_user_id_fkey";
DROP TRIGGER IF EXISTS verifications_set_updated ON "verifications";
DROP TRIGGER IF EXISTS accounts_set_updated ON "accounts";
DROP TRIGGER IF EXISTS sessions_set_updated ON "sessions";
DROP TRIGGER IF EXISTS users_set_updated ON "users";
DROP TABLE IF EXISTS "verifications";
DROP TABLE IF EXISTS "accounts";
DROP TABLE IF EXISTS "sessions";
DROP TABLE IF EXISTS "users";
