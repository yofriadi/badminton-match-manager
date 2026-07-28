import { fileURLToPath } from "node:url";
import { parseExecutionTarget, runD1Execute } from "./wrangler";

async function main() {
  const target = parseExecutionTarget(process.argv.slice(2));
  const output = await runD1Execute({
    target,
    file: "./seeders/courts.sql",
  });

  console.log(output.trim() || "Court seed completed");
}

const isMain =
  process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  main().catch((error) => {
    console.error("Failed to seed courts", error);
    process.exitCode = 1;
  });
}
