export function safeUrl(url: string | undefined | null): string | null {
  return url?.startsWith("https://") ? url : null;
}
