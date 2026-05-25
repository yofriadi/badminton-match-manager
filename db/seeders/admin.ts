import { rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { hashPassword } from "better-auth/crypto";
import { parseExecutionTarget, runD1Execute } from "./wrangler";

const ADMIN_NAME = "Admin";
function getSeedersDirectory() {
  return fileURLToPath(new URL(".", import.meta.url));
}

function escapeSqlLiteral(value: string) {
  return value.replaceAll("'", "''");
}

export function buildAdminSeedSql(input: {
  userId: string;
  accountId: string;
  email: string;
  passwordHash: string;
  now: number;
}) {
  const escapedEmail = escapeSqlLiteral(input.email.toLowerCase());
  const escapedName = escapeSqlLiteral(ADMIN_NAME);
  const escapedHash = escapeSqlLiteral(input.passwordHash);

  return `
INSERT OR IGNORE INTO users (
  id,
  email,
  name,
  email_verified,
  role,
  password,
  created_at,
  updated_at
) VALUES (
  '${input.userId}',
  '${escapedEmail}',
  '${escapedName}',
  1,
  'admin',
  NULL,
  ${input.now},
  ${input.now}
);

UPDATE users
SET
  role = 'admin',
  email_verified = 1,
  updated_at = ${input.now}
WHERE email = '${escapedEmail}';

INSERT INTO accounts (
  id,
  account_id,
  provider_id,
  user_id,
  password,
  created_at,
  updated_at
)
SELECT
  '${input.accountId}',
  users.id,
  'credential',
  users.id,
  '${escapedHash}',
  ${input.now},
  ${input.now}
FROM users
WHERE users.email = '${escapedEmail}'
  AND NOT EXISTS (
    SELECT 1
    FROM accounts
    WHERE accounts.provider_id = 'credential'
      AND accounts.account_id = users.id
  );

UPDATE accounts
SET
  password = '${escapedHash}',
  updated_at = ${input.now}
WHERE provider_id = 'credential'
  AND account_id = (
    SELECT id
    FROM users
    WHERE email = '${escapedEmail}'
    LIMIT 1
  );
`.trim();
}

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set.");
  }

  const sqlFile = `${getSeedersDirectory()}/.admin-seed.sql`;
  const sql = buildAdminSeedSql({
    userId: crypto.randomUUID(),
    accountId: crypto.randomUUID(),
    email: adminEmail,
    passwordHash: await hashPassword(adminPassword),
    now: Date.now(),
  });
  const target = parseExecutionTarget(process.argv.slice(2));

  await Bun.write(sqlFile, sql);

  try {
    const output = await runD1Execute({
      target,
      file: sqlFile,
    });

    console.log(output.trim() || `Admin seeded for ${adminEmail}`);
  } finally {
    await rm(sqlFile, { force: true });
  }
}

if (import.meta.main) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
