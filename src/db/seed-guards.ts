const LOOPBACK_DB_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

/**
 * Opt-in allowlist for deliberate non-loopback seed targets.
 *
 * Needed only when the seed runs inside a container that reaches the database over a private
 * service network (a compose service name like `db`), which is exactly how a deliberate,
 * reviewed database rebuild seeds the store. Default is empty: remote hosts are refused.
 */
export const REMOTE_HOST_ALLOWLIST_ENV = "SEED_ALLOW_REMOTE_HOSTS";

export function parseHostAllowlist(raw: string | undefined): Set<string> {
  return new Set(
    (raw ?? "")
      .split(",")
      .map((entry) => entry.trim().toLowerCase())
      .filter((entry) => entry.length > 0),
  );
}

export function databaseTarget(databaseUrl: string | undefined): { host: string; port: string; database: string } {
  if (!databaseUrl?.trim()) throw new Error("Seed requires DATABASE_URL for the target database.");
  let url: URL;
  try {
    url = new URL(databaseUrl);
  } catch {
    throw new Error("Seed requires a valid DATABASE_URL for the target database.");
  }
  const host = url.hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (!host) throw new Error("Seed requires a DATABASE_URL with an explicit host.");
  return { host, port: url.port || "3306", database: url.pathname.replace(/^\//, "").split("?")[0] };
}

/** Host/port/database only — never the credentials from DATABASE_URL. */
export function describeDatabaseTarget(databaseUrl: string | undefined): string {
  const { host, port, database } = databaseTarget(databaseUrl);
  return `${host}:${port}/${database || "(no database selected)"}`;
}

export function assertDatabaseTargetAllowed(databaseUrl: string | undefined, allowRemoteHosts?: string): void {
  const { host } = databaseTarget(databaseUrl);
  if (LOOPBACK_DB_HOSTS.has(host)) return;
  if (parseHostAllowlist(allowRemoteHosts).has(host)) return;
  throw new Error(
    `Seed is restricted to localhost/loopback MySQL; refusing host "${host}". ` +
      `To target this host deliberately, list it in ${REMOTE_HOST_ALLOWLIST_ENV}.`,
  );
}

export function assertLocalDatabase(databaseUrl: string | undefined): void {
  assertDatabaseTargetAllowed(databaseUrl);
}

export function assertBaseSeedAllowed(nodeEnv: string | undefined, databaseUrl: string | undefined, allowRemoteHosts?: string): void {
  if (nodeEnv !== "development" && nodeEnv !== "test") {
    throw new Error("Base seed requires NODE_ENV=development or test.");
  }
  assertDatabaseTargetAllowed(databaseUrl, allowRemoteHosts);
}

export function assertFixturesSeedAllowed(
  nodeEnv: string | undefined,
  optIn: string | undefined,
  databaseUrl: string | undefined,
  allowRemoteHosts?: string,
): void {
  if (nodeEnv !== "test" && nodeEnv !== "development") {
    throw new Error("Fixture seed requires NODE_ENV=test or development.");
  }
  if (optIn !== "1") {
    throw new Error("Fixture seed requires SEED_FIXTURES=1.");
  }
  assertDatabaseTargetAllowed(databaseUrl, allowRemoteHosts);
}

export function assertFixtureMatch<T>(
  existing: T | undefined,
  matches: (row: T) => boolean,
  message: string,
): T | undefined {
  if (existing !== undefined && !matches(existing)) throw new Error(message);
  return existing;
}

export async function insertIfMissing<T>(
  find: () => Promise<T | undefined>,
  insert: () => Promise<unknown>,
): Promise<"inserted" | "existing"> {
  if (await find() !== undefined) return "existing";
  await insert();
  return "inserted";
}

export function assertSeedDataValid(
  products: readonly { slug: string; sku: string; price: number; stock: number }[],
): void {
  const slugs = new Set<string>();
  const skus = new Set<string>();
  for (const product of products) {
    if (!product.slug.trim() || slugs.has(product.slug)) throw new Error(`Invalid or duplicate product slug: ${product.slug}`);
    if (!product.sku.trim() || skus.has(product.sku)) throw new Error(`Invalid or duplicate product SKU: ${product.sku}`);
    if (!Number.isInteger(product.price) || product.price <= 0) throw new Error(`Invalid price for ${product.slug}`);
    if (!Number.isInteger(product.stock) || product.stock < 0) throw new Error(`Invalid stock for ${product.slug}`);
    slugs.add(product.slug);
    skus.add(product.sku);
  }
}
