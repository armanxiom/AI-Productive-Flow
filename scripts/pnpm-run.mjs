import { spawnSync } from "node:child_process";
import path from "node:path";

function resolvePackageManager() {
  const execPath = process.env.npm_execpath;

  if (execPath) {
    const nodeExecPath = process.env.npm_node_execpath || process.execPath;
    const isJavaScriptEntrypoint = /\.[cm]?js$/i.test(execPath);

    if (isJavaScriptEntrypoint) {
      return {
        command: nodeExecPath,
        args: [execPath],
        label: "pnpm",
      };
    }

    return {
      command: execPath,
      args: [],
      label: "pnpm",
    };
  }

  const nodeBinDir = path.dirname(process.execPath);
  return {
    command: path.join(
      nodeBinDir,
      process.platform === "win32" ? "corepack.cmd" : "corepack",
    ),
    args: ["pnpm"],
    label: "corepack pnpm",
  };
}

export function runPackageManager(args, description) {
  const { command, args: prefixArgs, label } = resolvePackageManager();
  const result = spawnSync(command, [...prefixArgs, ...args], {
    env: process.env,
    stdio: "inherit",
  });

  if (result.error) {
    throw new Error(
      `Failed to start ${description} with ${label}: ${result.error.message}`,
    );
  }

  if (result.status !== 0) {
    const exitCode = result.status ?? 1;
    const signal = result.signal ? ` (signal ${result.signal})` : "";
    throw new Error(`${description} failed with exit code ${exitCode}${signal}`);
  }
}
