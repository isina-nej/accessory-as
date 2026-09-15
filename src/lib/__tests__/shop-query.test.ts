import { describe, expect, it } from "vitest";
import { shopQuerySchema } from "../products";
import { withQuery } from "../shop-query";

const base = shopQuerySchema.parse({});

describe("shop query", () => {
  it("defaults", () => {
    expect(base.sort).toBe("all");
    expect(base.page).toBe(1);
    expect(base.min).toBe(250000);
  });
  it("withQuery keeps sort, sets page", () => {
    expect(withQuery("/", base, { page: 3 })).toBe("/?page=3");
    expect(withQuery("/", base, { sort: "cheap", page: 1 })).toBe("/?sort=cheap");
  });
  it("rejects bad sort", () => {
    expect(shopQuerySchema.safeParse({ sort: "nope" }).success).toBe(false);
  });
});
