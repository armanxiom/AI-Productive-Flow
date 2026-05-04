import { runPackageManager } from "./pnpm-run.mjs";
import { pathToFileURL } from "node:url";

export function runTypecheck() {
  runPackageManager(["run", "typecheck:libs"], "library typecheck");
  runPackageManager(
    [
      "-r",
      "--filter",
      "./artifacts/**",
      "--filter",
      "./scripts",
      "--if-present",
      "run",
      "typecheck",
    ],
    "workspace typecheck",
  );
}

const isMainModule =
  process.argv[1] !== undefined &&
  pathToFileURL(process.argv[1]).href === import.meta.url;

if (isMainModule) {
  try {
    runTypecheck();
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
