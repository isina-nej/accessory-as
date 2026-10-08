import { describe, expect, it } from "vitest";
import { needsSignup, normalizeDigits, safeNextPath } from "../auth-ui";

describe("auth input boundaries", () => {
  it("normalizes Persian and Arabic digits", () => {
    expect(normalizeDigits("۰۹۱٢٣٤٥٦٧٨٩")).toBe("09123456789");
  });
  it("redirects only to local paths", () => {
    expect(safeNextPath("/checkout?step=2")).toBe("/checkout?step=2");
    for (const unsafe of ["https://evil.test", "//evil.test", "/\\evil.test", "/%5C%5Cevil.test"]) {
      expect(safeNextPath(unsafe)).toBe("/");
    }
  });
  it("offers signup only for users without a name", () => {
    expect(needsSignup({ name: "09123456789" }, "09123456789")).toBe(true);
    expect(needsSignup({ name: "" }, "a@example.com")).toBe(true);
    expect(needsSignup({ name: "علی ملکی" }, "09123456789")).toBe(false);
  });
});
