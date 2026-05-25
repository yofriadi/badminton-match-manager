import { parseExecutionTarget, runD1Execute } from "./wrangler";

async function main() {
  const target = parseExecutionTarget(process.argv.slice(2));
  const output = await runD1Execute({
    target,
    file: "./seeders/halls.sql",
  });

  console.log(output.trim() || "Hall seed completed");
}

if (import.meta.main) {
  main().catch((error) => {
    console.error("Failed to seed halls", error);
    process.exitCode = 1;
  });
}
