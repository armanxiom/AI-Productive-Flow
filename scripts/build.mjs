import { runPackageManager } from "./pnpm-run.mjs";
import { runTypecheck } from "./typecheck.mjs";

const buildAll =
  process.env.BUILD_ALL === "1" || process.env.BUILD_ALL === "true";

try {
  runTypecheck();

  if (buildAll) {
    console.log("Building the full workspace build set.");
    runPackageManager(
      ["-r", "--if-present", "run", "build"],
      "workspace build",
    );
  } else {
    console.log("Building the web workspace only.");
    runPackageManager(
      ["--filter", "@workspace/mockup-sandbox", "run", "build"],
      "@workspace/mockup-sandbox build",
    );
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
