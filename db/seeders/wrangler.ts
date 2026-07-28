import { spawn } from "node:child_process";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

export type D1ExecutionTarget = "--local" | "--remote" | "--preview";

const wranglerConfigPath = "../wrangler.jsonc";

function getPackageDirectory() {
  return fileURLToPath(new URL("..", import.meta.url));
}

export function parseExecutionTarget(argv: string[]): D1ExecutionTarget {
  if (argv.includes("--remote")) {
    return "--remote";
  }

  if (argv.includes("--preview")) {
    return "--preview";
  }

  return "--local";
}

function getDatabaseName() {
  return process.env.D1_DATABASE_NAME || "badminton";
}

export async function runD1Execute(options: {
  target: D1ExecutionTarget;
  command?: string;
  file?: string;
  json?: boolean;
}) {
  const databaseName = getDatabaseName();
  const absoluteWranglerConfigPath = resolve(
    getPackageDirectory(),
    wranglerConfigPath,
  );
  const args = [
    "wrangler",
    "-c",
    absoluteWranglerConfigPath,
    "d1",
    "execute",
    databaseName,
    options.target,
    "--yes",
  ];

  if (options.json) {
    args.push("--json");
  }

  if (options.file) {
    const absoluteFilePath = resolve(getPackageDirectory(), options.file);
    args.push("--file", absoluteFilePath);
  } else if (options.command) {
    args.push("--command", options.command);
  } else {
    throw new Error("Either a SQL command or a SQL file is required.");
  }

  return new Promise<string>((resolve, reject) => {
    const processHandle = spawn("pnpm", ["exec", ...args], {
      cwd: getPackageDirectory(),
      // Use shell to make it cross-platform compatible if needed,
      // but pnpm should be in path on macOS/Linux.
      shell: false,
    });

    let stdout = "";
    let stderr = "";

    processHandle.stdout?.on("data", (data) => {
      stdout += data.toString();
    });

    processHandle.stderr?.on("data", (data) => {
      stderr += data.toString();
    });

    processHandle.on("close", (code) => {
      if (code !== 0) {
        reject(
          new Error(
            stderr.trim() ||
              stdout.trim() ||
              `wrangler d1 execute failed with exit code ${code}`,
          ),
        );
      } else {
        resolve(stdout);
      }
    });

    processHandle.on("error", (err) => {
      reject(err);
    });
  });
}
