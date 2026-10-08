export function normalizeDigits(value: string): string {
  return value.replace(/[۰-۹٠-٩]/g, (digit) => {
    const code = digit.charCodeAt(0);
    return String(code >= 0x06f0 ? code - 0x06f0 : code - 0x0660);
  });
}

export function safeNextPath(value: string | null): string {
  if (!value?.startsWith("/") || value.startsWith("//") || /\\|%5c|%2f/i.test(value)) return "/";
  try {
    const url = new URL(value, "http://localhost");
    return url.origin === "http://localhost" ? url.pathname + url.search + url.hash : "/";
  } catch {
    return "/";
  }
}

export function needsSignup(user: { name?: string | null; email?: string | null }, identifier: string): boolean {
  return !user.name?.trim() || user.name.trim() === identifier;
}
