import { describe, expect, it } from "vitest";
import { formatToman, toFa, tomanToRial } from "../fa";

describe("fa helpers", () => {
  it("digits", () => expect(toFa(4250000)).toBe("۴۲۵۰۰۰۰"));
  it("toman", () => expect(formatToman(4250000)).toBe("۴,۲۵۰,۰۰۰ تومن"));
  it("rial", () => expect(tomanToRial(250000)).toBe(2500000));
});
