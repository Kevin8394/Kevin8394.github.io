import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const nextBin = path.join(projectRoot, "node_modules", "next", "dist", "bin", "next");
const result = spawnSync(process.execPath, [nextBin, "build"], {
  cwd: projectRoot,
  env: { ...process.env, GITHUB_PAGES_EXPORT: "1" },
  stdio: "inherit",
});

if (result.status !== 0) process.exit(result.status ?? 1);
mkdirSync(path.join(projectRoot, "out"), { recursive: true });
writeFileSync(path.join(projectRoot, "out", ".nojekyll"), "");
