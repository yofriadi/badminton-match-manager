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
  const databaseName = process.env.D1_DATABASE_NAME;

  if (!databaseName) {
    throw new Error("D1_DATABASE_NAME must be set.");
  }

  return databaseName;
}

export async function runD1Execute(options: {
  target: D1ExecutionTarget;
  command?: string;
  file?: string;
  json?: boolean;
}) {
  const databaseName = getDatabaseName();
  const args = [
    "wrangler",
    "-c",
    wranglerConfigPath,
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
    args.push("--file", options.file);
  } else if (options.command) {
    args.push("--command", options.command);
  } else {
    throw new Error("Either a SQL command or a SQL file is required.");
  }

  const processHandle = Bun.spawn({
    cmd: ["bunx", ...args],
    cwd: getPackageDirectory(),
    stdout: "pipe",
    stderr: "pipe",
  });

  const [stdout, stderr, exitCode] = await Promise.all([
    new Response(processHandle.stdout).text(),
    new Response(processHandle.stderr).text(),
    processHandle.exited,
  ]);

  if (exitCode !== 0) {
    throw new Error(stderr || stdout || `wrangler d1 execute failed with exit code ${exitCode}`);
  }

  return stdout;
}
