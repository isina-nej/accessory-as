import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const repoRoot = fileURLToPath(new URL("..", import.meta.url));
const migrationDir = `${repoRoot}src/db/drizzle`;
const BREAKPOINT = "--> statement-breakpoint";
const BASELINE_START = "-- >>> baseline schema (generated)";
const BASELINE_END = "-- <<< baseline schema";

const journal = JSON.parse(readFileSync(`${migrationDir}/meta/_journal.json`, "utf8")) as {
  entries: { idx: number; tag: string; when: number }[];
};

function normalize(sql: string): string[] {
  return sql
    .split(BREAKPOINT)
    .join("\n")
    .split("\n")
    .filter((line) => !line.trimStart().startsWith("--"))
    .join("\n")
    .split(";")
    .map((statement) => statement.replace(/\s+/g, " ").trim())
    .filter((statement) => statement.length > 0);
}

describe("init.sql bootstrap", () => {
  const entry = journal.entries[0];
  const migration = readFileSync(`${migrationDir}/${entry.tag}.sql`, "utf8");
  const initSql = readFileSync(`${repoRoot}init.sql`, "utf8");

  it("has a single baseline migration that replaces the previous chain", () => {
    expect(journal.entries).toHaveLength(1);
    expect(entry.tag).toBe("0000_initial_schema");
  });

  it("creates exactly the same statements as the baseline migration", () => {
    const start = initSql.indexOf(BASELINE_START);
    const end = initSql.indexOf(BASELINE_END);
    expect(start).toBeGreaterThan(-1);
    expect(end).toBeGreaterThan(start);
    expect(normalize(initSql.slice(start, end))).toEqual(normalize(migration));
  });

  it("contains no drizzle statement separators, which MySQL/MariaDB cannot parse", () => {
    // `--> x` is not a SQL comment (the double dash must be followed by whitespace), so the
    // separators are fine inside a migration file that drizzle splits itself, but not in a
    // script executed by the database entrypoint.
    expect(initSql).not.toContain("-->");
  });

  it("records the baseline as applied so drizzle-kit migrate is a no-op on a fresh volume", () => {
    const hash = createHash("sha256").update(migration).digest("hex");
    expect(initSql).toContain(`('${hash}', ${entry.when})`);
  });

  it("never drops existing tables", () => {
    expect(initSql).not.toMatch(/DROP\s+(TABLE|DATABASE)/i);
  });
});
