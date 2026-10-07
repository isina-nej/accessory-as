import { describe, expect, it } from "vitest";
import { PAGE_SIZE, shopQuerySchema } from "../products";
import { shopImage } from "../shop-images";
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
  it("shows four rows of four cards per shop page", () => {
    expect(PAGE_SIZE).toBe(16);
  });
  it("uses only jewelry assets for seeded shop products", () => {
    expect(shopImage("full-nagin-ring")).toBe("/images/figma-new/prod-card.webp");
    expect(shopImage("double-nagin-earring")).toBe("/images/figma-new/prod-card.webp");
    expect(shopImage("women-anklet")).toBe("/images/figma-landing/offers-anklet.webp");
    expect(shopImage("unknown")).toBeNull();
  });
});
