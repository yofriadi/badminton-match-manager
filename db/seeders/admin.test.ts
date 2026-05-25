import { describe, expect, test } from "vitest";
import { buildAdminSeedSql } from "./admin";
import { parseExecutionTarget } from "./wrangler";

describe("buildAdminSeedSql", () => {
  test("normalizes email and escapes SQL literals", () => {
    const sql = buildAdminSeedSql({
      userId: "user-id",
      accountId: "account-id",
      email: "Admin.O'Neil@Example.COM",
      passwordHash: "hash'with quote",
      now: 1_234,
    });

    expect(sql).toContain("'admin.o''neil@example.com'");
    expect(sql).toContain("'hash''with quote'");
    expect(sql).toContain("role = 'admin'");
    expect(sql).not.toContain("Admin.O'Neil@Example.COM");
  });

  test("creates credential account statements tied to the user id lookup", () => {
    const sql = buildAdminSeedSql({
      userId: "user-id",
      accountId: "account-id",
      email: "admin@example.com",
      passwordHash: "hashed-password",
      now: 5_678,
    });

    expect(sql).toContain("INSERT INTO accounts");
    expect(sql).toContain("provider_id = 'credential'");
    expect(sql).toContain("account_id = users.id");
    expect(sql).toContain("SELECT id");
    expect(sql).toContain("LIMIT 1");
  });
});

describe("parseExecutionTarget", () => {
  test("defaults to local execution", () => {
    expect(parseExecutionTarget([])).toBe("--local");
  });

  test("prefers remote or preview flags when present", () => {
    expect(parseExecutionTarget(["--remote"])).toBe("--remote");
    expect(parseExecutionTarget(["--preview"])).toBe("--preview");
  });
});
