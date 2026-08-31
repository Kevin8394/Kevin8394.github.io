#!/usr/bin/env node
// Rebuilds the site from source_code/ and replaces the published copy at the
// repository root.
//
//   node tools/publish.mjs [--dry-run] [--skip-build]
//
// This is the whole deploy pipeline in one command; it replaces the manual
// build / rm / cp / post-process sequence in source_code/GITHUB_PAGES.md.
//
//  1. build source_code/ (writes source_code/out/)
//  2. delete the previously published export from the repository root,
//     keeping only the entries in KEEP
//  3. copy source_code/out/. to the repository root
//  4. node tools/prepare-pages-export.js -- flattens the segment-prefetch
//     payloads, lowercases charSet/fetchPriority, and verifies every reference
//     resolves. It exits non-zero if the export is not publishable.

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceDir = path.join(repoRoot, "source_code");
const exportDir = path.join(sourceDir, "out");

// Everything at the repository root that is NOT part of the published export.
// Anything else at the root is build output and is replaced on every publish.
const KEEP = new Set([
  ".git",
  ".gitattributes",
  ".gitignore",
  ".github",
  "source_code",
  "tools",
  "README.md",
  "CNAME",
  "LICENSE",
]);

const dryRun = process.argv.includes("--dry-run");
const skipBuild = process.argv.includes("--skip-build");
const log = (...a) => console.log(...a);

function run(command, args, cwd) {
  const result = spawnSync(command, args, { cwd, stdio: "inherit" });
  if (result.status !== 0) {
    console.error(`\nFailed: ${command} ${args.join(" ")}`);
    process.exit(result.status ?? 1);
  }
}

// --- 1. build ---------------------------------------------------------------

if (skipBuild) {
  log("Skipping build (--skip-build); using the existing source_code/out/.");
} else {
  log("Building source_code/ ...\n");
  // This is what `npm run build:github-pages` runs. Invoking it with the
  // current node binary keeps the pipeline off Windows' npm.cmd, which cannot
  // be spawned without a shell on current Node versions.
  run(process.execPath, [path.join(sourceDir, "scripts", "build-github-pages.mjs")], sourceDir);
}

if (!fs.existsSync(path.join(exportDir, "index.html"))) {
  console.error(`\nNo index.html in ${exportDir}; the build did not produce an export.`);
  process.exit(1);
}

// --- 2. remove the previously published export ------------------------------

const stale = fs.readdirSync(repoRoot).filter((entry) => !KEEP.has(entry));
log(`\n${dryRun ? "Would remove" : "Removing"} ${stale.length} published entries from the repository root.`);
if (!dryRun) {
  for (const entry of stale) fs.rmSync(path.join(repoRoot, entry), { recursive: true, force: true });
}

// --- 3. copy the fresh export into place ------------------------------------

log(`${dryRun ? "Would copy" : "Copying"} source_code/out/. to the repository root.`);
if (!dryRun) fs.cpSync(exportDir, repoRoot, { recursive: true });

if (dryRun) {
  log("\nDry run: nothing was changed.");
  process.exit(0);
}

// --- 4. post-process and verify ---------------------------------------------

log("");
run(process.execPath, [path.join(repoRoot, "tools", "prepare-pages-export.js")], repoRoot);

log("\nPublished. Commit the repository root to deploy.");
