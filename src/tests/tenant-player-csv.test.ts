import { describe, expect, test } from "vitest";
import {
  parseTenantPlayersCsv,
  serializeTenantPlayersCsv,
} from "@/app/halls/lib/tenant-player-csv";

describe("parseTenantPlayersCsv", () => {
  test("parses tenant player rows from csv", () => {
    const records = parseTenantPlayersCsv(
      `id,name,gender,skillLevel\n1,Alice,female,advanced\n2,Bob,male,beginner`,
    );

    expect(records).toEqual([
      {
        id: "1",
        name: "Alice",
        gender: "female",
        skillLevel: "advanced",
      },
      {
        id: "2",
        name: "Bob",
        gender: "male",
        skillLevel: "beginner",
      },
    ]);
  });

  test("accepts skill_level headers and quoted fields", () => {
    const records = parseTenantPlayersCsv(
      `name,gender,skill_level\n"Doe, Jane",women,intermediate`,
    );

    expect(records).toEqual([
      {
        name: "Doe, Jane",
        gender: "female",
        skillLevel: "intermediate",
      },
    ]);
  });

  test("rejects invalid rows with useful errors", () => {
    expect(() =>
      parseTenantPlayersCsv(
        `name,gender,skillLevel\n,male,advanced\nChris,other,pro`,
      ),
    ).toThrow("Row 2: name is required. Row 3: gender must be male or female.");
  });
});

describe("serializeTenantPlayersCsv", () => {
  test("escapes values for export", () => {
    const csv = serializeTenantPlayersCsv([
      {
        id: "1",
        name: '"Ace", Jane',
        gender: "female",
        skillLevel: "advanced",
      },
    ]);

    expect(csv).toBe(
      'id,name,gender,skillLevel\n1,"""Ace"", Jane",female,advanced',
    );
  });
});
