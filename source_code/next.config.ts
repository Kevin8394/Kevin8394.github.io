import type { NextConfig } from "next";

const isGithubPagesExport = process.env.GITHUB_PAGES_EXPORT === "1";
const githubPagesBasePath = (process.env.GITHUB_PAGES_BASE_PATH ?? "").replace(/\/$/, "");

const nextConfig: NextConfig = isGithubPagesExport
  ? {
      output: "export",
      trailingSlash: true,
      basePath: githubPagesBasePath,
      assetPrefix: githubPagesBasePath || undefined,
      images: { unoptimized: true },
      typescript: { tsconfigPath: "tsconfig.github-pages.json" },
      env: { NEXT_PUBLIC_SITE_BASE_PATH: githubPagesBasePath },
    }
  : {};

export default nextConfig;
