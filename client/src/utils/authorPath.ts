export function authorPagePath(name: string): string {
  return `/author/${encodeURIComponent(name)}`;
}
