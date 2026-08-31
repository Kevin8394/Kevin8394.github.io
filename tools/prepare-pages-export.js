#!/usr/bin/env node
// Post-processes a static Next.js export so it is correct for GitHub Pages,
// then verifies it.
//
//   node tools/prepare-pages-export.js [export-directory]
//
// The directory defaults to the current working directory, which is where the
// published copy of this site lives (the repository root). Pass a path to run
// it against a fresh `source_code/out` instead.
//
// This repository is the root user site (Kevin8394.github.io), so the site root
// is "/" and the export keeps Next's root-absolute asset paths.
//
// Three jobs:
//
//  1. Flatten the App Router's segment-prefetch payloads. `next build` with
//     `output: "export"` writes them as nested directories
//     (`__next.projects/$d$slug/__PAGE__.txt`) but the client router requests
//     the dot-joined name (`__next.projects.$d$slug.__PAGE__.txt`). Left alone,
//     every page load fires 404s for its prefetches and link navigation falls
//     back to full page loads.
//  2. Lowercase the two camelCase attributes React emits (`charSet`,
//     `fetchPriority`) so the published markup is valid lowercase HTML.
//  3. Verify every href/src in every exported page resolves to a real file, and
//     that `.nojekyll` exists (without it GitHub Pages refuses to serve
//     `/_next/*`, because the path starts with an underscore).

const fs = require("fs");
const path = require("path");

const siteRoot = path.resolve(process.argv[2] ?? process.cwd());
const skipDirectories = new Set([".git", "node_modules", "source_code", "tools"]);

if (!fs.existsSync(path.join(siteRoot, "index.html"))) {
  console.error(`No index.html in ${siteRoot}; is that the export directory?`);
  process.exit(1);
}

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (skipDirectories.has(entry.name)) return [];
    const fullPath = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(fullPath) : [fullPath];
  });
}

function findSegmentDirectories(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (skipDirectories.has(entry.name)) return [];
    if (!entry.isDirectory()) return [];
    const fullPath = path.join(directory, entry.name);
    return entry.name.startsWith("__next.")
      ? [fullPath]
      : findSegmentDirectories(fullPath);
  });
}

// --- 1. flatten segment-prefetch payloads -----------------------------------

let flattened = 0;

for (const segmentDirectory of findSegmentDirectories(siteRoot)) {
  const parent = path.dirname(segmentDirectory);
  const prefix = path.basename(segmentDirectory);

  for (const file of walk(segmentDirectory)) {
    const suffix = path
      .relative(segmentDirectory, file)
      .split(path.sep)
      .join(".");
    const flatPath = path.join(parent, `${prefix}.${suffix}`);
    fs.renameSync(file, flatPath);
    flattened += 1;
  }

  fs.rmSync(segmentDirectory, { recursive: true, force: true });
}

// --- 2. normalise attribute casing -----------------------------------------

const htmlFiles = walk(siteRoot).filter((file) => file.endsWith(".html"));
let normalised = 0;

for (const file of htmlFiles) {
  const original = fs.readFileSync(file, "utf8");
  const updated = original
    .replace(/\bcharSet=/g, "charset=")
    .replace(/\bfetchPriority=/g, "fetchpriority=");
  if (updated !== original) {
    fs.writeFileSync(file, updated, "utf8");
    normalised += 1;
  }
}

// --- 3. verify ---------------------------------------------------------------

const problems = [];
let checkedReferences = 0;

for (const file of htmlFiles) {
  const html = fs.readFileSync(file, "utf8");

  for (const match of html.matchAll(/(?:href|src)="([^"#]+)(?:#[^"]*)?"/g)) {
    const url = match[1];
    if (/^(?:https?:|mailto:|tel:|data:|javascript:)/i.test(url)) continue;

    checkedReferences += 1;
    // Root-absolute URLs resolve from the site root, the rest from the page.
    const target = url.startsWith("/")
      ? path.join(siteRoot, url)
      : path.resolve(path.dirname(file), url);
    const exists =
      fs.existsSync(target) ||
      fs.existsSync(`${target}.html`) ||
      fs.existsSync(path.join(target, "index.html"));

    if (!exists) problems.push(`${path.relative(siteRoot, file)} -> ${url}`);
  }
}

if (!fs.existsSync(path.join(siteRoot, ".nojekyll"))) {
  problems.push(".nojekyll is missing; GitHub Pages will not serve /_next/*");
}
if (!fs.existsSync(path.join(siteRoot, "404.html"))) {
  problems.push("404.html is missing; GitHub Pages will show its default 404");
}
if (findSegmentDirectories(siteRoot).length > 0) {
  problems.push("segment-prefetch directories are still nested");
}

console.log(
  `Flattened ${flattened} segment payloads, normalised ${normalised} of ` +
    `${htmlFiles.length} HTML files, checked ${checkedReferences} references.`,
);

if (problems.length > 0) {
  console.error(`Problems:\n${problems.map((p) => `  ${p}`).join("\n")}`);
  process.exitCode = 1;
} else {
  console.log("Export is ready for GitHub Pages.");
}
