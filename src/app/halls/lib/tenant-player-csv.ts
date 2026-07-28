import type { PlayerGender, SkillLevel } from "./types";

export interface TenantPlayerCsvRecord {
  id?: string;
  name: string;
  gender: PlayerGender;
  skillLevel: SkillLevel;
}

const REQUIRED_HEADERS = ["name", "gender", "skillLevel"] as const;
const HEADER_ALIASES: Record<string, keyof TenantPlayerCsvRecord> = {
  id: "id",
  name: "name",
  gender: "gender",
  skilllevel: "skillLevel",
  skill_level: "skillLevel",
  "skill level": "skillLevel",
};

const VALID_GENDERS = new Set<PlayerGender>(["male", "female"]);
const VALID_SKILL_LEVELS = new Set<SkillLevel>([
  "unrated",
  "beginner",
  "novice",
  "intermediate",
  "advanced",
  "pro",
]);

function escapeCsvField(value: string) {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replaceAll('"', '""')}"`;
  }

  return value;
}

function parseCsvRows(csvText: string) {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = "";
  let inQuotes = false;

  for (let index = 0; index < csvText.length; index += 1) {
    const character = csvText[index];

    if (character === '"') {
      const nextCharacter = csvText[index + 1];

      if (inQuotes && nextCharacter === '"') {
        currentField += '"';
        index += 1;
        continue;
      }

      inQuotes = !inQuotes;
      continue;
    }

    if (!inQuotes && character === ",") {
      currentRow.push(currentField);
      currentField = "";
      continue;
    }

    if (!inQuotes && (character === "\n" || character === "\r")) {
      currentRow.push(currentField);
      rows.push(currentRow);
      currentRow = [];
      currentField = "";

      if (character === "\r" && csvText[index + 1] === "\n") {
        index += 1;
      }

      continue;
    }

    currentField += character;
  }

  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField);
    rows.push(currentRow);
  }

  return rows;
}

function normalizeHeader(value: string) {
  const normalized = value
    .replace(/^\uFEFF/, "")
    .trim()
    .toLowerCase();
  return HEADER_ALIASES[normalized] ?? null;
}

function normalizeGender(value: string) {
  const normalized = value.trim().toLowerCase();

  if (normalized === "men") return "male" satisfies PlayerGender;
  if (normalized === "women") return "female" satisfies PlayerGender;
  if (VALID_GENDERS.has(normalized as PlayerGender)) {
    return normalized as PlayerGender;
  }

  return null;
}

function normalizeSkillLevel(value: string) {
  const normalized = value.trim().toLowerCase();

  if (VALID_SKILL_LEVELS.has(normalized as SkillLevel)) {
    return normalized as SkillLevel;
  }

  return null;
}

function isBlankRow(row: string[]) {
  return row.every((cell) => cell.trim().length === 0);
}

export function parseTenantPlayersCsv(csvText: string) {
  const rows = parseCsvRows(csvText);

  if (rows.length === 0) {
    throw new Error("CSV file is empty.");
  }

  const headerRow = rows[0] ?? [];
  const columnIndexes = new Map<keyof TenantPlayerCsvRecord, number>();

  headerRow.forEach((header, index) => {
    const normalizedHeader = normalizeHeader(header);

    if (!normalizedHeader) {
      return;
    }

    if (columnIndexes.has(normalizedHeader)) {
      throw new Error(`Duplicate CSV header: ${header.trim() || header}`);
    }

    columnIndexes.set(normalizedHeader, index);
  });

  for (const header of REQUIRED_HEADERS) {
    if (!columnIndexes.has(header)) {
      throw new Error(`Missing required CSV header: ${header}`);
    }
  }

  const records: TenantPlayerCsvRecord[] = [];
  const errors: string[] = [];

  for (let rowIndex = 1; rowIndex < rows.length; rowIndex += 1) {
    const row = rows[rowIndex] ?? [];

    if (isBlankRow(row)) {
      continue;
    }

    const lineNumber = rowIndex + 1;
    const name = row[columnIndexes.get("name") ?? -1]?.trim() ?? "";
    const gender = normalizeGender(
      row[columnIndexes.get("gender") ?? -1] ?? "",
    );
    const skillLevel = normalizeSkillLevel(
      row[columnIndexes.get("skillLevel") ?? -1] ?? "",
    );
    const id = row[columnIndexes.get("id") ?? -1]?.trim() || undefined;

    if (!name) {
      errors.push(`Row ${lineNumber}: name is required.`);
    }

    if (!gender) {
      errors.push(`Row ${lineNumber}: gender must be male or female.`);
    }

    if (!skillLevel) {
      errors.push(
        `Row ${lineNumber}: skillLevel must be one of unrated, beginner, novice, intermediate, advanced, or pro.`,
      );
    }

    if (!name || !gender || !skillLevel) {
      continue;
    }

    records.push({
      id,
      name,
      gender,
      skillLevel,
    });
  }

  if (errors.length > 0) {
    throw new Error(errors.join(" "));
  }

  return records;
}

export function serializeTenantPlayersCsv(players: TenantPlayerCsvRecord[]) {
  const header = "id,name,gender,skillLevel";
  const rows = players.map((player) =>
    [player.id ?? "", player.name, player.gender, player.skillLevel]
      .map(escapeCsvField)
      .join(","),
  );

  return [header, ...rows].join("\n");
}
