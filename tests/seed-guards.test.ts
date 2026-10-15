import { describe, expect, it } from "vitest";
import {
  assertBaseSeedAllowed,
  assertDatabaseTargetAllowed,
  assertFixtureMatch,
  assertFixturesSeedAllowed,
  assertLocalDatabase,
  assertSeedDataValid,
  describeDatabaseTarget,
  insertIfMissing,
} from "../src/db/seed-guards";

const localUrl = "mysql://seed:seed@127.0.0.1:3307/accessory_test";

describe("seed safety gates", () => {
  it("allows base seed only in development/test on loopback DB", () => {
    expect(() => assertBaseSeedAllowed("development", localUrl)).not.toThrow();
    expect(() => assertBaseSeedAllowed("test", "mysql://seed:seed@localhost/db")).not.toThrow();
    for (const env of [undefined, "", "production", "staging"] as const) {
      expect(() => assertBaseSeedAllowed(env, localUrl)).toThrow(/NODE_ENV/);
    }
  });

  it("rejects missing, malformed, or remote database URLs", () => {
    for (const url of [undefined, "", "not a URL", "mysql://user:pass@db.example.com/shop"] as const) {
      expect(() => assertLocalDatabase(url)).toThrow();
      expect(() => assertBaseSeedAllowed("development", url)).toThrow();
    }
    expect(() => assertLocalDatabase("mysql://u:p@[::1]:3306/test")).not.toThrow();
  });

  it("allows fixtures only with explicit opt-in in development/test on loopback", () => {
    expect(() => assertFixturesSeedAllowed("test", "1", localUrl)).not.toThrow();
    expect(() => assertFixturesSeedAllowed("development", "1", localUrl)).not.toThrow();
    for (const [env, flag, url] of [
      ["production", "1", localUrl],
      ["test", "0", localUrl],
      ["development", undefined, localUrl],
      [undefined, "1", localUrl],
      ["test", "1", "mysql://u:p@remote.example/shop"],
    ] as const) {
      expect(() => assertFixturesSeedAllowed(env, flag, url)).toThrow();
    }
  });

  it("is insert-only and repeatable with an existing-record store", async () => {
    const store = new Map<string, { value: string }>();
    let inserts = 0;
    const seed = () => insertIfMissing(
      async () => store.get("fixture"),
      async () => {
        inserts += 1;
        store.set("fixture", { value: "seeded" });
      },
    );

    expect(await seed()).toBe("inserted");
    store.set("fixture", { value: "manually edited" });
    expect(await seed()).toBe("existing");
    expect(inserts).toBe(1);
    expect(store.get("fixture")?.value).toBe("manually edited");
    await expect(insertIfMissing(async () => undefined, async () => { throw new Error("insert failed"); })).rejects.toThrow("insert failed");
  });

  it("fails closed when an existing fixture row differs from its expected shape", () => {
    const expected = { owner: "fixture", amount: 100, status: "pending" };
    expect(assertFixtureMatch(expected, (row) => row.owner === "fixture" && row.amount === 100 && row.status === "pending", "fixture collision")).toBe(expected);
    expect(() => assertFixtureMatch(
      { ...expected, amount: 99 },
      (row) => row.owner === "fixture" && row.amount === 100 && row.status === "pending",
      "fixture collision",
    )).toThrow("fixture collision");
    expect(assertFixtureMatch(undefined, () => false, "fixture collision")).toBeUndefined();
  });

  it("accepts valid catalog rows", () => {
    expect(() => assertSeedDataValid([{ slug: "ring", sku: "R-1", price: 100, stock: 0 }])).not.toThrow();
  });

  it("rejects duplicate identifiers and invalid prices or stock", () => {
    expect(() => assertSeedDataValid([
      { slug: "ring", sku: "R-1", price: 100, stock: 1 },
      { slug: "ring", sku: "R-2", price: 100, stock: 1 },
    ])).toThrow(/slug/i);
    expect(() => assertSeedDataValid([
      { slug: "ring", sku: "R-1", price: 100, stock: 1 },
      { slug: "chain", sku: "R-1", price: 100, stock: 1 },
    ])).toThrow(/SKU/i);
    expect(() => assertSeedDataValid([{ slug: "ring", sku: "R-1", price: 0, stock: 1 }])).toThrow(/price/i);
    expect(() => assertSeedDataValid([{ slug: "ring", sku: "R-1", price: 100, stock: -1 }])).toThrow(/stock/i);
  });
});

describe("remote seed target allowlist", () => {
  const remoteUrl = "mysql://seed:***@db:3306/accessory_as";

  it("keeps refusing non-loopback hosts by default", () => {
    expect(() => assertDatabaseTargetAllowed(remoteUrl)).toThrow(/refusing host/);
    expect(() => assertBaseSeedAllowed("development", remoteUrl)).toThrow(/refusing host/);
    for (const raw of [undefined, "", "   ", "db2,other"] as const) {
      expect(() => assertDatabaseTargetAllowed(remoteUrl, raw)).toThrow(/SEED_ALLOW_REMOTE_HOSTS/);
    }
  });

  it("allows only the host named in the opt-in allowlist", () => {
    expect(() => assertDatabaseTargetAllowed(remoteUrl, "db")).not.toThrow();
    expect(() => assertDatabaseTargetAllowed(remoteUrl, " db , cache ")).not.toThrow();
    expect(() => assertDatabaseTargetAllowed(remoteUrl, "DB")).not.toThrow();
    expect(() => assertBaseSeedAllowed("development", remoteUrl, "db")).not.toThrow();
    expect(() => assertFixturesSeedAllowed("test", "1", remoteUrl, "db")).not.toThrow();
    expect(() => assertDatabaseTargetAllowed("mysql://seed:***@db-replica:3306/accessory_as", "db")).toThrow(/refusing host/);
    expect(() => assertFixturesSeedAllowed("test", "0", remoteUrl, "db")).toThrow(/SEED_FIXTURES/);
  });

  it("summarises the target without leaking credentials", () => {
    expect(describeDatabaseTarget("mysql://user:***@db:3306/accessory_as")).toBe("db:3306/accessory_as");
    expect(describeDatabaseTarget("mysql://user:***@127.0.0.1/accessory_as")).toBe("127.0.0.1:3306/accessory_as");
    expect(describeDatabaseTarget("mysql://user:***@[::1]:3307/accessory_as")).toBe("::1:3307/accessory_as");
  });
});
