# GitHub Pages deployment

This repository is `Kevin8394/Kevin8394.github.io`, a **root user site**, so the
site is served from `https://kevin8394.github.io/` and the export uses
root-absolute asset paths (`/_next/...`). There is no base path to configure.

Use the following command to host on localhost:3000 for pre-deployment testing

npx serve source_code/out -l 3000


The published site is the static export committed to the **repository root**;
`source_code/` holds the Next.js app it is generated from, and `tools/` holds the
post-build step. Pages is configured as *Deploy from a branch* → branch root.

## Rebuilding the published site

Edit the app in `source_code/` (page copy lives in `app/page.tsx`, project
content in `app/data/projects.ts`), then from the **repository root**:

```bash
node tools/publish.mjs
```

That one command runs the whole pipeline:

1. builds `source_code/` into `source_code/out/`,
2. deletes the previously published export from the repository root (keeping
   `.git`, `source_code`, `tools`, and the other entries in the script's `KEEP`
   set),
3. copies `source_code/out/.` to the repository root,
4. runs `tools/prepare-pages-export.js` to post-process and verify it.

Then commit the repository root to deploy.

Useful flags: `--dry-run` reports what would be removed and copied without
touching anything; `--skip-build` republishes the existing `source_code/out/`.

Do not edit the generated HTML at the repository root. Every string appears
twice there -- once in the server-rendered markup and once escaped inside the
`self.__next_f.push([...])` hydration payload -- and React hydrates from the
payload, so an edit to the markup alone is reverted in the browser. It would
also be overwritten by the next publish.

### Doing it by hand

The equivalent manual sequence, from `source_code/`:

```bash
npm ci
npm run build:github-pages     # writes source_code/out/
```

Then, from the repository root:

```bash
# remove the previous export (keep .git, source_code and tools)
rm -rf .nojekyll 404 404.html __next.*.txt _next _not-found favicon.svg \
       file.svg globe.svg images index.html index.txt projects window.svg
cp -a source_code/out/. .
node tools/prepare-pages-export.js
```

Keep build output out of `source_code/` itself. `/out/` and `/.next/` are
gitignored, and Tailwind's automatic source detection skips gitignored paths --
a stray un-ignored copy (`out.prev/`, say) gets scanned as source and silently
inflates the generated CSS.

`prepare-pages-export.js` must run on every export. It:

1. **Flattens the App Router's segment-prefetch payloads.** `next build` with
   `output: "export"` writes them as nested directories
   (`__next.projects/$d$slug/__PAGE__.txt`) but the client router requests the
   dot-joined name (`__next.projects.$d$slug.__PAGE__.txt`). Without this step
   every page load fires 404s for its prefetches and link navigation degrades to
   full page loads.
2. Lowercases the two camelCase attributes React emits (`charSet`,
   `fetchPriority`).
3. Verifies every `href`/`src` in every exported page resolves to a real file,
   and that `.nojekyll` and `404.html` are present. It exits non-zero if not.

`.nojekyll` is required: without it GitHub Pages refuses to serve `/_next/*`,
because the path starts with an underscore.

The export contains `index.html`, one `index.html` per project, compiled CSS and
JavaScript, all images, embedded PDFs, animated GIFs, and downloadable STL files
— about 24 MB in total.

## Alternative: build in CI

`.github/workflows/deploy-pages.yml` in this directory builds the app and
publishes `out/` through *Source → GitHub Actions*. To use it, move it to
`.github/workflows/` at the **repository root** and point its steps at
`source_code/` (`working-directory: source_code`, artifact `source_code/out`),
adding a `node tools/prepare-pages-export.js source_code/out` step after the
build. As written it assumes the app is at the repository root, and GitHub only
runs workflows found at the repository root, so it is currently inert.
