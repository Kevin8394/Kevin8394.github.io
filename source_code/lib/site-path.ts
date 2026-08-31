const siteBasePath = process.env.NEXT_PUBLIC_SITE_BASE_PATH ?? "";

export function assetPath(path: string): string;
export function assetPath(path: undefined): undefined;
export function assetPath(path: string | undefined) {
  if (!path || /^(?:[a-z]+:)?\/\//i.test(path) || path.startsWith("data:")) return path;
  return `${siteBasePath}${path.startsWith("/") ? path : `/${path}`}`;
}
